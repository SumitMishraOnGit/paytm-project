
const zod = require("zod");
const { User, Account } = require("../db"); 
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;
const express = require('express');
const router = express.Router();

const signupbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
});

// --------------- signup -----------------
router.post('/signup', async (req, res) => {
    const { success } = signupbody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Email already taken / Incorrect inputs" });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });
    
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.create([{
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }], { session });
        
        const userId = user[0]._id;

        // Create account with random initial balance
        await Account.create([{
            userId,
            balance: 1 + Math.random() * 10000
        }], { session });

        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        await session.commitTransaction();

        res.json({
            message: "User created successfully",
            token: token
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    } finally {
        session.endSession();
    }
});

const signinbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

// --------------- signin -----------------
router.post('/signin', async (req, res) => {
    const { success } = signinbody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ message: "Invalid email or password format" });
    }
    
    try {
        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        });

        if (user) {
            const token = jwt.sign({
                userId: user._id 
            }, JWT_SECRET);
            return res.status(200).json({ 
                message: "Signin successful",
                token: token 
            });
        }

        res.status(401).json({ message: "Invalid email or password" }); 
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const updatebody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
});

// --------------- update info -----------------
router.put('/', authMiddleware, async(req, res) => {
    const { success } = updatebody.safeParse(req.body);
    if( !success ){
        res.status(411).json({	message: "Error while updating information"});
        return;
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message: "Updated successfully"
    });
});

// bulk users route
router.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            {
                firstName: {
                    "$regex": filter,
                    "$options": "i"
                }
            },
            {
                lastName: {
                    "$regex": filter,
                    "$options": "i"
                }
            }
        ]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

router.get("/getUser", authMiddleware, async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        if(user){
            return res.json({
                firstName: user.firstName,
            })
        }
        res.status(404).json({
            message: "User not found"
        })
    } catch(e) {
        res.status(500).json({
            message: "Error fetching user data"
        })
    }
})

module.exports = router;