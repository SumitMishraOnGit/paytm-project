const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const signupbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

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

router.get('/signin', async( req, res )=>{
    const success = signupbody.safeParse(req.body);
    if( !success ){
        res.status(411).json({ message: "Email already taken / Incorrect inputs" })
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

module.exports = router;