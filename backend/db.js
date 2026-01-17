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

// Transaction Ledger Schema - Immutable record of all transfers
const transactionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0']
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    status: {
        type: String,
        enum: ['completed', 'failed', 'pending'],
        default: 'completed'
    },
    reference: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        default: 'Fund Transfer',
        maxLength: 100
    },
    // Snapshot of balances at transaction time for audit
    senderBalanceAfter: {
        type: Number,
        required: true
    },
    receiverBalanceAfter: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient user transaction queries
transactionSchema.index({ senderId: 1, timestamp: -1 });
transactionSchema.index({ receiverId: 1, timestamp: -1 });

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    User,
    Account,
    Transaction,
};