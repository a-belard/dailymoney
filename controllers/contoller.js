const router = require("express").Router()
const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

let date = new Date();

router.post("/user",async (req,res) => {
    try {
        let {names, phone, country, password, email, username, walletAddress, gender, referredby} = req.body
    
        let existUser = await User.findOne({
            email
        })
        if (existUser) {
            return res.status(400).json({
                emailExist: true,
                message: "Email already exists"
            })
        }
    
        let existUsername = await User.findOne({
            username
        })
        if (existUsername) {
            return res.status(400).json({
                usernameExist: true,
                message: "Username taken."
            })
        }
    
        const salt = 10;
        const hashedPass = await bcrypt.hash(`${password}`, salt);
    
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
    
        let newUser = new User({names, 
                               phone, 
                               country, 
                               password: hashedPass, 
                               walletAddress, 
                               gender, 
                               username, 
                               email, 
                               referredby,
                               initTime: date,
                               endTime: date.addDays(1),
                               yearStart: date,
                               yearEnd: date.addDays(366),
                               verified: false
                            })
        await newUser.save()
        .then(data => res.json(data))
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.post("/login", async (req, res) => {
    try {
        const {username, password} = req.body;
        const result = await User.findOne({
            username
        })
        if (!result) {
            return res.status(400).json({
                success: false,
                message: `Incorrect username or password`
            })
        }

        else if (result.verified !== true) {
            return res.status(400).json({
                success: false,
                message: "Verify your email in order to login"
            })
        } else {
            const checkPassword = await bcrypt.compare(password, result.password)
            if (!checkPassword) {
                return res.status(400).json({
                    success: false,
                    message: `Incorrect email or password`
                })
            } else {
                let {_id, names, username, email, gender, balance, walletAddress, totWithdrew, totDeposited, country, phone, referredby} = result;
                const token = jwt.sign({
                    _id, names, email, gender, username, balance, walletAddress, totDeposited, totWithdrew, phone, country, referredby
                }, process.env.app_private_key,{expiresIn: "1 days"});
                return res.status(200).json({
                    success: true,
                    token: token
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
})

router.get("/users",async (req,res) => {
    await User.find()   
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err))
})

router.delete("/users",async (req,res) => {
    await User.deleteMany({})
    .then(() => res.json("All deleted"))
    .catch((err) => res.status(400).json(err))
})

module.exports = router