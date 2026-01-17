const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, Transaction } = require("../db");
const mongoose = require("mongoose");
const crypto = require("crypto");

const router = express.Router();

// Helper function to generate unique transaction reference
const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(4).toString('hex');
  return `TXN-${timestamp}-${randomPart}`.toUpperCase();
};

// Get user balance
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

// Transfer funds with transaction ledger recording
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to, description } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: "Invalid transfer amount" });
  }

  // Don't allow transfer to oneself
  if (to === req.userId) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: "Cannot transfer to yourself!" });
  }

  try {
    // Fetch sender's account within transaction
    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // Fetch receiver's account within transaction
    const receiverAccount = await Account.findOne({
      userId: to,
    }).session(session);

    if (!receiverAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid recipient account",
      });
    }

    // Calculate new balances
    const senderNewBalance = senderAccount.balance - amount;
    const receiverNewBalance = receiverAccount.balance + amount;

    // Perform the transfer within transaction
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Create immutable transaction record in ledger
    const transactionRecord = await Transaction.create([{
      senderId: req.userId,
      receiverId: to,
      amount: amount,
      reference: generateTransactionRef(),
      description: description || 'Fund Transfer',
      status: 'completed',
      senderBalanceAfter: senderNewBalance,
      receiverBalanceAfter: receiverNewBalance
    }], { session });

    // Commit Transaction - all or nothing!
    await session.commitTransaction();

    res.json({
      message: "Transfer successful",
      transactionId: transactionRecord[0].reference,
      amount: amount,
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

// Get transaction history for the authenticated user
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Filter by transaction type
    if (type === 'sent') {
      query = { senderId: req.userId };
    } else if (type === 'received') {
      query = { receiverId: req.userId };
    } else {
      // All transactions involving the user
      query = {
        $or: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      };
    }

    // Fetch transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName')
      .lean();

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);

    // Transform transactions to include direction
    const formattedTransactions = transactions.map(txn => ({
      id: txn._id,
      reference: txn.reference,
      amount: txn.amount,
      type: txn.senderId._id.toString() === req.userId ? 'debit' : 'credit',
      counterparty: txn.senderId._id.toString() === req.userId
        ? `${txn.receiverId.firstName} ${txn.receiverId.lastName}`
        : `${txn.senderId.firstName} ${txn.senderId.lastName}`,
      description: txn.description,
      status: txn.status,
      balanceAfter: txn.senderId._id.toString() === req.userId
        ? txn.senderBalanceAfter
        : txn.receiverBalanceAfter,
      timestamp: txn.timestamp,
      createdAt: txn.createdAt
    }));

    res.json({
      transactions: formattedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalTransactions: totalCount,
        hasMore: skip + transactions.length < totalCount
      }
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: "Error fetching transaction history" });
  }
});

// Get single transaction details by reference
router.get("/transactions/:reference", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      reference: req.params.reference,
      $or: [
        { senderId: req.userId },
        { receiverId: req.userId }
      ]
    })
      .populate('senderId', 'firstName lastName username')
      .populate('receiverId', 'firstName lastName username')
      .lean();

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      transaction: {
        reference: transaction.reference,
        amount: transaction.amount,
        type: transaction.senderId._id.toString() === req.userId ? 'debit' : 'credit',
        sender: {
          name: `${transaction.senderId.firstName} ${transaction.senderId.lastName}`,
          email: transaction.senderId.username
        },
        receiver: {
          name: `${transaction.receiverId.firstName} ${transaction.receiverId.lastName}`,
          email: transaction.receiverId.username
        },
        description: transaction.description,
        status: transaction.status,
        timestamp: transaction.timestamp,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error("Transaction detail error:", error);
    res.status(500).json({ message: "Error fetching transaction details" });
  }
});

module.exports = router;