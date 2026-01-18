// backend/db.js
const mongoose = require('mongoose');

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

// Transaction Schema - Audit trail for all money movements
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT', 'P2P_SENT', 'P2P_RECEIVED'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    // For P2P transfers - who is the other party
    relatedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // For linking paired P2P transactions (sender's txn linked to receiver's txn)
    relatedTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    // Description of the transaction
    description: {
        type: String,
        default: ''
    },
    // For future Razorpay integration
    razorpayOrderId: {
        type: String,
        default: null,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    // Balance after this transaction (for quick reference)
    balanceAfter: {
        type: Number,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for efficient user transaction queries
transactionSchema.index({ userId: 1, createdAt: -1 });

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    User,
    Account,
    Transaction,
};