const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const JWT_SECRET = process.env.JWT_SECRET;

const signupbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})
// --------------- signup -----------------
router.post('/signup', async( req, res )=>{
    const success = signupbody.safeParse(req.body);
    if( !success ){
        res.status(411).json({ message: "Email already taken / Incorrect inputs" })
    }
    
    
    const existingUser = await User.findone({
        username: req.body.username
    })
    
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = new User.create({
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName
    })

    const userId = user._id

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})

const signinbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})
// --------------- signin -----------------
router.get('/signin', async( req, res )=>{
    const success = signupbody.safeParse(req.body);
    if( !success ){
        res.status(411).json({ message: "Invalid email / Incorrect inputs" })
    }
    
    const user = await User.findone({
        username:req.body.username,
        password:req.body.password
    })

    if(user){
        const token = jwt.sign({
        userId
    }, JWT_SECRET);
        res.status(200).json({token: token});
    }

    res.status(411).json({message: "error while logging in"})
})

const updatebody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

// --------------- update info -----------------
router.put('/', authMiddleware, async(req, res) => {
    const success = updatebodybody.safeParse(req.body);
    if( !success ){
        res.status(411).json({	message: "Error while updating information"})
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message: "Updated successfully"
    })
})
module.exports = router;