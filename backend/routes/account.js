const express = require("express");
const { authMiddleware } = require("../middleware");
const { transferLimiter } = require("../middleware/rateLimiter");
const { Account, Transaction, User } = require("../db");
const mongoose = require("mongoose");

const router = express.Router();

// --------------- Get Balance -----------------
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      balance: account.balance,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    res.status(500).json({ message: "Error fetching balance" });
  }
});

// --------------- P2P Transfer with Transaction Records -----------------
// Rate limit: 10 transfers per minute per user
router.post("/transfer", authMiddleware, transferLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, to } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Don't allow transfer to oneself
    if (to === req.userId || to === req.userId.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot transfer to yourself!" });
    }

    // Fetch sender's account within transaction
    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sender account not found" });
    }

    // Step 0.5: Suspicious activity detection
    if (amount > senderAccount.balance * 5) {
      console.warn(`[SUSPICIOUS] User ${req.userId} requested transfer of ${amount} but balance is ${senderAccount.balance}`);
      // In production: await logSuspiciousActivity(req.userId, 'HIGH_AMOUNT_REQUEST', { amount, balance: senderAccount.balance });
    }

    // Check sufficient balance
    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Fetch receiver's account within transaction
    const receiverAccount = await Account.findOne({
      userId: to,
    }).session(session);

    if (!receiverAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient account not found" });
    }

    // Get receiver's info for description
    const receiver = await User.findById(to).session(session);
    const sender = await User.findById(req.userId).session(session);

    // Calculate new balances
    const senderNewBalance = senderAccount.balance - amount;
    const receiverNewBalance = receiverAccount.balance + amount;

    // Perform the balance updates
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Step 0.3: Create transaction records for audit trail
    // Create sender's transaction (DEBIT)
    const senderTransaction = await Transaction.create([{
      userId: req.userId,
      type: 'P2P_SENT',
      amount: amount,
      status: 'SUCCESS',
      relatedUserId: to,
      description: `Sent to ${receiver?.firstName || 'User'} ${receiver?.lastName || ''}`.trim(),
      balanceAfter: senderNewBalance
    }], { session });

    // Create receiver's transaction (CREDIT)
    const receiverTransaction = await Transaction.create([{
      userId: to,
      type: 'P2P_RECEIVED',
      amount: amount,
      status: 'SUCCESS',
      relatedUserId: req.userId,
      description: `Received from ${sender?.firstName || 'User'} ${sender?.lastName || ''}`.trim(),
      balanceAfter: receiverNewBalance
    }], { session });

    // Link the transactions to each other
    await Transaction.updateOne(
      { _id: senderTransaction[0]._id },
      { relatedTransactionId: receiverTransaction[0]._id }
    ).session(session);

    await Transaction.updateOne(
      { _id: receiverTransaction[0]._id },
      { relatedTransactionId: senderTransaction[0]._id }
    ).session(session);

    // Commit Transaction
    await session.commitTransaction();

    res.json({
      message: "Transfer successful",
      transactionId: senderTransaction[0]._id,
      newBalance: senderNewBalance
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Transfer failed. Please try again." });
  } finally {
    session.endSession();
  }
});

// --------------- Step 0.4: Transaction History -----------------
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional type filter
    const typeFilter = req.query.type; // 'P2P_SENT', 'P2P_RECEIVED', 'CREDIT', 'DEBIT'

    // Build query
    const query = { userId: req.userId };
    if (typeFilter && ['P2P_SENT', 'P2P_RECEIVED', 'CREDIT', 'DEBIT'].includes(typeFilter)) {
      query.type = typeFilter;
    }

    // Fetch transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('relatedUserId', 'firstName lastName') // Get related user's name
      .lean();

    // Get total count for pagination info
    const totalCount = await Transaction.countDocuments(query);

    res.json({
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        relatedUser: tx.relatedUserId ? {
          id: tx.relatedUserId._id,
          name: `${tx.relatedUserId.firstName} ${tx.relatedUserId.lastName}`.trim()
        } : null,
        createdAt: tx.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalTransactions: totalCount,
        hasMore: skip + transactions.length < totalCount
      }
    });

  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: "Error fetching transaction history" });
  }
});

// --------------- Get Single Transaction -----------------
router.get("/transactions/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId // Ensure user can only see their own transactions
    })
      .populate('relatedUserId', 'firstName lastName')
      .lean();

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      description: transaction.description,
      balanceAfter: transaction.balanceAfter,
      relatedUser: transaction.relatedUserId ? {
        id: transaction.relatedUserId._id,
        name: `${transaction.relatedUserId.firstName} ${transaction.relatedUserId.lastName}`.trim()
      } : null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });

  } catch (error) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({ message: "Error fetching transaction" });
  }
});

module.exports = router;