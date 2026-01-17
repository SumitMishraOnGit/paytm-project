# 📄 PRD: Razorpay Integration for "ThePaymentsApp"
## Bridging Internal Ledger with External Financial Reality

---

## 📌 Document Metadata

| Field               | Value                                      |
|---------------------|--------------------------------------------|
| **Project Name**    | ThePaymentsApp                             |
| **Document Type**   | Product Requirements Document (PRD)        |
| **Version**         | 1.0.0                                      |
| **Created**         | 2026-01-17                                 |
| **Author**          | Development Team                           |
| **Status**          | Planning                                   |

---

## 1. Executive Summary

### 1.1 What is ThePaymentsApp?

ThePaymentsApp is a **Paytm-like digital wallet** application that allows users to:
- Create accounts with secure authentication (bcrypt password hashing)
- View wallet balances
- Transfer money to other users on the platform

### 1.2 Current Tech Stack

| Layer       | Technology                                                        |
|-------------|-------------------------------------------------------------------|
| **Frontend**| React + Vite, Tailwind CSS, Axios, React Router DOM               |
| **Backend** | Node.js + Express, Mongoose, Zod, JWT, bcrypt                     |
| **Database**| MongoDB                                                           |
| **Hosting** | Vercel (Frontend) + Render (Backend)                              |

### 1.3 What's Already Built ✅

| Feature                    | Status | Notes                                                  |
|----------------------------|--------|--------------------------------------------------------|
| User Signup/Signin         | ✅ Done | With bcrypt password hashing                           |
| JWT Authentication         | ✅ Done | Token-based auth with middleware                       |
| Balance Inquiry            | ✅ Done | `/api/v1/account/balance`                              |
| P2P Transfer               | ✅ Done | **ACID transactions** via MongoDB sessions             |
| User Search                | ✅ Done | Regex-based search with `/api/v1/user/bulk`            |
| Responsive UI              | ✅ Done | Loading skeletons, error states                        |
| Balance Polling            | ✅ Done | Auto-refresh every 5 seconds                           |

---

## 2. 🚨 The Problem Statement

### 2.1 The "Logic Gap" (Current Flaw)

> **"Where does the money come from?"**

**Current Implementation:**
```javascript
// In user.js signup route (Line 57-60)
await Account.create([{
    userId,
    balance: 1 + Math.random() * 10000  // ← THE PROBLEM
}], { session });
```

This is a **Closed Loop System**:
- Money "appears" from nowhere (random balance on signup)
- This isn't a payment app — it's a **database editor**
- **Security Flaw**: Anyone with Postman can theoretically manipulate balances

### 2.2 The "Killer" Interview Question

> *"What's stopping me from opening Postman and sending 100 requests to an 'Add Money' endpoint to get free money?"*

**Your answer should be:** "Nothing — because the money never comes from the real world. I verify funds through Razorpay before touching my database."

### 2.3 The Real Problem You're Solving

```
"I need to bridge my internal ledger (MongoDB) with an external financial entity 
(Razorpay) while ensuring that:
  1. No user can spoof a payment
  2. No network failure can cause a mismatch between Razorpay's state and my database
  3. Duplicate webhook calls don't give users double money"
```

This is a problem of **Data Integrity, Security, and Idempotency** — not just math.

---

## 3. 📊 Current Architecture Analysis

### 3.1 Data Models

```javascript
// User Schema
{
  username: String (email),
  password: String (hashed),
  firstName: String,
  lastName: String
}

// Account Schema  
{
  userId: ObjectId (ref: User),
  balance: Number
}
```

### 3.2 Current API Endpoints

| Method | Endpoint                      | Auth Required | Purpose              |
|--------|-------------------------------|---------------|----------------------|
| POST   | `/api/v1/user/signup`         | No            | Create new user      |
| POST   | `/api/v1/user/signin`         | No            | Login, get JWT       |
| PUT    | `/api/v1/user/`               | Yes           | Update user info     |
| GET    | `/api/v1/user/bulk`           | Yes           | Search users         |
| GET    | `/api/v1/user/getUser`        | Yes           | Get current user     |
| GET    | `/api/v1/account/balance`     | Yes           | Get wallet balance   |
| POST   | `/api/v1/account/transfer`    | Yes           | P2P money transfer   |

### 3.3 What's Missing

| Feature                     | Current State           |
|-----------------------------|-------------------------|
| Add Money (Top-Up)          | ❌ Not implemented      |
| Payment Gateway Integration | ❌ Not implemented      |
| Webhook Handling            | ❌ Not implemented      |
| Transaction History         | ❌ Not implemented      |
| Payment State Management    | ❌ Not implemented      |

---

## 4. 🎯 Proposed Solution

### 4.1 The "Open Loop" Flow

```
┌─────────────┐    Step 1: "I want to add ₹500"     ┌─────────────┐
│   Frontend  │ ────────────────────────────────▶   │   Backend   │
└─────────────┘                                     └─────────────┘
                                                           │
                                                    Step 2: Create Order
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │  Razorpay   │
                                                    │   Server    │
                                                    └─────────────┘
                                                           │
                                                    Returns: order_id
                                                           │
┌─────────────┐    Step 3: Return order to client   ┌─────────────┐
│   Frontend  │ ◀────────────────────────────────   │   Backend   │
└─────────────┘                                     └─────────────┘
       │
Step 4: User pays via Razorpay Checkout
       │
       ▼
┌─────────────┐
│  Razorpay   │
│  Checkout   │ (UPI, Card, Netbanking)
└─────────────┘
       │
Step 5: Payment Complete
       │
       ├──────────────────────────────────────────────────────────┐
       │                                                          │
       ▼                                                          ▼
┌─────────────┐                                           ┌─────────────┐
│   Frontend  │  User sees success                        │   Backend   │
└─────────────┘                                           │  (Webhook)  │
                                                          └─────────────┘
                                                                 │
                                                          Step 6: Verify Signature
                                                          Step 7: Update Balance (ACID)
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │   MongoDB   │
                                                          │ balance += ₹│
                                                          └─────────────┘
```

### 4.2 Why Webhooks Are Critical

**The "Edge Case" that makes this interview-worthy:**

> User clicks "Pay" → Payment succeeds on Razorpay → User's browser crashes → Frontend callback never fires

**Without Webhooks:** User's money is lost forever  
**With Webhooks:** Razorpay notifies your server → Balance updates in background

---

## 5. 📐 Technical Requirements

### 5.1 New Data Models

```javascript
// Transaction Schema (NEW)
{
  userId: ObjectId (ref: User),
  razorpayOrderId: String (indexed),
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: String (default: "INR"),
  status: Enum ["CREATED", "PENDING", "SUCCESS", "FAILED"],
  type: Enum ["CREDIT", "DEBIT"],  // CREDIT = Add Money, DEBIT = P2P/Withdraw
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    toUserId: ObjectId (optional, for P2P transfers),
    description: String
  }
}
```

### 5.2 New API Endpoints

| Method | Endpoint                           | Auth  | Purpose                              |
|--------|------------------------------------|-------|--------------------------------------|
| POST   | `/api/v2/payment/create-order`     | Yes   | Create Razorpay order                |
| POST   | `/api/v2/payment/verify`           | Yes   | Verify payment after frontend success|
| POST   | `/api/v2/payment/webhook`          | No*   | Receive Razorpay webhooks            |
| GET    | `/api/v2/transactions`             | Yes   | Get transaction history              |
| GET    | `/api/v2/transactions/:id`         | Yes   | Get single transaction detail        |

> *Webhook endpoint uses Razorpay signature verification instead of JWT

### 5.3 Environment Variables (New)

```env
# Existing
MONGO_URI=<your_mongo_connection>
JWT_SECRET=<your_jwt_secret>

# New (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

### 5.4 Security Requirements

| Requirement              | Implementation                                             |
|--------------------------|------------------------------------------------------------|
| **Signature Verification**| Validate `razorpay_signature` using HMAC SHA256           |
| **Idempotency**          | Check if `razorpay_order_id` already processed before updating balance |
| **Webhook Security**     | Verify webhook signature using `RAZORPAY_WEBHOOK_SECRET`   |
| **ACID Transactions**    | Wrap balance updates in MongoDB sessions (already done!)   |
| **Rate Limiting**        | Limit `/create-order` to prevent order spam                |

---

## 6. 🖥️ Frontend Requirements

### 6.1 New UI Components

| Component              | Purpose                                            |
|------------------------|----------------------------------------------------|
| **TopUpModal**         | Amount input + "Pay Now" button                    |
| **PaymentStatus**      | Shows "Processing", "Success", "Failed" states     |
| **TransactionHistory** | List of all transactions (credits + debits)        |
| **AddMoneyButton**     | Prominent CTA on Dashboard                         |

### 6.2 Updated User Flow

```
Dashboard
    │
    ├── [View Balance]     ───▶ Already exists
    │
    ├── [Add Money] (NEW)  ───▶ Opens TopUpModal
    │       │
    │       ├── User enters amount
    │       │
    │       ├── Calls POST /api/v2/payment/create-order
    │       │
    │       ├── Opens Razorpay Checkout
    │       │
    │       ├── On Success: Calls POST /api/v2/payment/verify
    │       │
    │       └── Shows PaymentStatus component
    │
    ├── [Send Money]       ───▶ Already exists (P2P transfer)
    │
    └── [Transaction History] (NEW) ───▶ Shows all credits/debits
```

### 6.3 Razorpay Checkout Integration

```javascript
// Frontend: TopUpModal.jsx (pseudocode)
const handlePayment = async (amount) => {
  // Step 1: Create order on backend
  const { data } = await axios.post('/api/v2/payment/create-order', { amount });
  
  // Step 2: Open Razorpay Checkout
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: data.amount,
    currency: "INR",
    order_id: data.orderId,
    handler: async (response) => {
      // Step 3: Verify on backend
      await axios.post('/api/v2/payment/verify', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
      // Step 4: Show success + refresh balance
    }
  };
  
  const razorpay = new Razorpay(options);
  razorpay.open();
};
```

---

## 7. 🔄 Backend Implementation Plan

### 7.1 Phase 1: Foundation

| Task                                      | Priority | Complexity |
|-------------------------------------------|----------|------------|
| Add `Transaction` model to `db.js`        | High     | Low        |
| Install `razorpay` npm package            | High     | Low        |
| Create `payment.js` route file            | High     | Medium     |
| Add Razorpay environment variables        | High     | Low        |

### 7.2 Phase 2: Core Payment Flow

| Task                                      | Priority | Complexity |
|-------------------------------------------|----------|------------|
| Implement `POST /create-order`            | High     | Medium     |
| Implement `POST /verify`                  | High     | High       |
| Implement `POST /webhook`                 | High     | High       |
| Add idempotency checks                    | High     | Medium     |

### 7.3 Phase 3: Polish

| Task                                      | Priority | Complexity |
|-------------------------------------------|----------|------------|
| Implement `GET /transactions`             | Medium   | Low        |
| Implement `GET /transactions/:id`         | Medium   | Low        |
| Add rate limiting to `/create-order`      | Medium   | Low        |
| Update existing transfer to create Transaction records | Medium | Medium |

---

## 8. 📝 Webhook Handler Logic (Critical)

```javascript
// routes/payment.js - Webhook handler (pseudocode)

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Step 1: Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body);
  
  // Step 2: Handle payment.captured event
  if (event.event === 'payment.captured') {
    const { order_id, id: payment_id, amount } = event.payload.payment.entity;
    
    // Step 3: Idempotency check
    const existingTx = await Transaction.findOne({ 
      razorpayOrderId: order_id,
      status: 'SUCCESS'
    });
    
    if (existingTx) {
      return res.json({ status: 'already_processed' });
    }
    
    // Step 4: Update in ACID transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await Transaction.updateOne(
        { razorpayOrderId: order_id },
        { 
          status: 'SUCCESS',
          razorpayPaymentId: payment_id
        }
      ).session(session);
      
      await Account.updateOne(
        { userId: transaction.userId },
        { $inc: { balance: amount / 100 } }  // Razorpay sends paisa
      ).session(session);
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  res.json({ status: 'ok' });
});
```

---

## 9. ✅ Success Criteria

### 9.1 Functional Requirements

| Requirement                                           | Verified By           |
|-------------------------------------------------------|-----------------------|
| User can add money via Razorpay (Test Mode)           | Manual testing        |
| Balance only updates after payment verification       | Unit tests            |
| Duplicate webhooks don't double-credit balance        | Integration tests     |
| P2P transfers still work correctly                    | Regression tests      |
| Failed payments don't affect balance                  | Error scenario tests  |

### 9.2 Non-Functional Requirements

| Requirement                                           | Target                |
|-------------------------------------------------------|-----------------------|
| Webhook processing time                               | < 500ms               |
| Order creation latency                                | < 1s                  |
| 99.9% webhook delivery success                        | Razorpay SLA          |

### 9.3 Interview-Ready Checklist

- [ ] Can explain the difference between Closed Loop and Open Loop
- [ ] Can explain why webhooks are necessary (browser crash scenario)
- [ ] Can explain idempotency and why it's critical
- [ ] Can explain signature verification using HMAC
- [ ] Can explain why ACID transactions are used for balance updates
- [ ] Can show working demo with test mode payments

---

## 10. 🚫 Out of Scope (For Now)

| Feature                     | Reason                                           |
|-----------------------------|--------------------------------------------------|
| Real money withdrawals      | Requires Business PAN + Payout API verification  |
| Multiple currency support   | MVP is INR only                                  |
| Subscription payments       | Not relevant for wallet top-up                   |
| Saved cards                 | Razorpay handles this automatically              |
| Refunds                     | Can be Phase 2                                   |

---

## 11. 🎯 Implementation Priority

```
Week 1:
├── Transaction Model
├── /create-order endpoint
├── /verify endpoint
└── Frontend TopUpModal

Week 2:
├── /webhook endpoint
├── Idempotency logic
├── Transaction history API
└── Frontend TransactionHistory

Week 3:
├── Error handling improvements
├── Rate limiting
├── Comprehensive testing
└── Documentation updates
```

---

## 12. 📚 Resources

- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Razorpay Test Mode Dashboard](https://dashboard.razorpay.com/app/dashboard)
- [Razorpay Webhook Events](https://razorpay.com/docs/webhooks/)
- [Razorpay Signature Verification](https://razorpay.com/docs/payments/server-integration/nodejs/)

---

## 13. 💡 Summary

**Before (Closed Loop):**
```
User clicks button → Database: balance += random → 🚨 INSECURE
```

**After (Open Loop):**
```
User clicks "Add Money" → Razorpay Order Created → User Pays → 
Razorpay Verifies → Webhook Received → Signature Verified → 
Idempotency Checked → ACID Transaction → Balance Updated → ✅ SECURE
```

**The "Killer" sentence for your interview:**

> "I implemented a payment flow where money only enters my system after being cryptographically verified by Razorpay, with idempotency guarantees to prevent double-crediting, and webhook handlers to ensure no payment is ever lost even if the user's browser crashes."

---

*End of PRD*
