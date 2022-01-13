const router = require("express").Router()
const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken");
const AdminNotification = require("../models/adminNotificationModel");
const Notification = require("../models/notificationsModel");
const updateBalance = require("./updateBalance");
const { sendEmail } = require("../utils/sendEmail");
const Transaction = require("../models/transactions");

let date = new Date();
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

router.get("/user/:id", async (req,res) => {
    try {
        let user = await User.findOne({_id: req.params.id})
        if(user.referredby){
            var referralUsername = await User.findById(user.referredby)
            referralUsername = referralUsername.username
        }
        return res.json({user, referralUsername})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.post("/user",async (req,res) => {
    try {
        let {names, phone, country, password, email, username, walletAddress, gender, referredby} = req.body
        let existUsername = await User.findOne({
            username
        })
        if (existUsername) {
            return res.status(400).json({
                usernameExist: true,
                message: "Username is already taken !!"
            })
        }

        let existUser = await User.findOne({
            email
        })
        if (existUser) {
            return res.status(400).json({
                emailExist: true,
                message: "Email already exists !!"
            })
        }
    
        const salt = 10;
        const hashedPass = await bcrypt.hash(`${password}`, salt);
    
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
        .then((data) => {
            let options = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Dailymoney verification",
                text: `    
                    <div style="font-family: 'Trebuchet MS'">
                        <h2 style="color: dodgerblue">Hello ${username}👋</h2>
                        <p>
                            Thanks for joining <strong>Dailymoney</strong><br> 
                            now you remain only one step for confirming membership.
                            <br>
                        </p>
                        <h4>
                            Please click the below button for your verification and after login with your credentials. 
                        </h4>
                        <div style="width: 120px; height:50px; background-color:dodgerblue; border-radius:7px; display:flex;justify-items:center;align-items:center">
                            <a href="https://dailymoneybusiness.herokuapp.com/verified/${data._id}" style="text-decoration: none; padding: 15px 40px; border-radius: 7px; font-weight: bold; background-color: dodgerblue; color: white;">
                                <strong>APPROVE</strong>
                            </a>
                        </div>
                    </div>
                `
            }
            sendEmail(options);
            res.json(data)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.patch("/user/:_id", async (req, res) => {
    try {
        let {username, email} = req.body
        let existUsername = await User.findOne({
            username
        })
        if (existUsername && existUsername._id.toString() !== req.params._id) {
            return res.status(400).json({
                usernameExist: true,
                message: "Username is already taken !!"
            })
        }

        let existUser = await User.findOne({
            email
        })
        if (existUser && existUser._id.toString() !== req.params._id) {
            return res.status(400).json({
                emailExist: true,
                message: "Email already taken !!"
            })
        }

        await User.updateOne({_id: req.params._id}, req.body)
        .then(() => {
            res.json("Update")
        }, err => {
            throw err
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.post("/verify", async (req,res) => {
    try {
        let {email, id, username} = req.body
        let options = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Dailymoney verification",
            text: `    
                <div style="font-family: 'Trebuchet MS'">
                    <h2 style="color: dodgerblue">Hello ${username}👋</h2>
                    <p>
                        Thanks for joining <strong>Dailymoney</strong><br> 
                        now you remain only one step for confirming membership.
                        <br>
                    </p>
                    <h4>
                        Please click the below button for your verification and after login with your credentials. 
                    </h4>
                    <div style="width: 120px; height:50px; background-color:dodgerblue; border-radius:7px; display:flex;justify-items:center;align-items:center">
                        <a href="https://dailymoneybusiness.herokuapp.com/verified/${id}" style="text-decoration: none; padding: 15px 40px; border-radius: 7px; font-weight: bold; background-color: dodgerblue; color: white;">
                            <strong>APPROVE</strong>
                        </a>
                    </div>
                </div>
            `
        } 
        sendEmail(options)
        return res.json("Sent")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.get("/verified/:id", async (req,res) => {
    try {
        let user = await User.findOne({"_id": req.params.id})
        await User.updateOne({_id: user._id}, {
            $set: {
                verified: true,
                createdAt: new Date()
            }
        })
        let newNotification = new AdminNotification({
                type: "green",
                content: user.username + " signed up!",
            })
            await newNotification.save()
            .then(()=>{}, err => {throw err})

            if(user.referredby){
                   await User.updateOne({_id: user.referredby},{
                    $addToSet: {
                        referrals: String(user._id)
                    }
                })
                .then(() => {}, err => {throw err})
                let newNotification = new Notification({
                    type: "green",
                    content: "Good. You got a new referral called " + user.username,
                    userId: user.referredby
                })
                newNotification.save()
                .then(()=>{}, err => {throw err})
            }
            return res.redirect("http://dailymoneyprovider.netlify.app/login")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.get("/username/:id", async (req,res) => {
    let user = await User.findOne({_id: String(req.params.id)})
    return res.json(String(user.username))
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
                message: "Verify your email in order to login!",
                id: result._id,
                email: result.email
            })
        } else {
            const checkPassword = await bcrypt.compare(password, result.password)
            if (!checkPassword) {
                return res.status(400).json({
                    success: false,
                    message: `Incorrect username or password!`
                })
            } else {
                let {_id, names, username, email, gender, balance, walletAddress, totWithdrew, totDeposited, country, phone, referredby} = result;
                const token = jwt.sign({
                    _id, names, username
                }, process.env.app_private_key,{expiresIn: "1 days"});

                res.status(200).json({
                    success: true,
                    token: token,
                })
                updateBalance(result)
                return
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

router.get("/referrals/:id", async (req,res) => {
    try {
        let referrals = await User.find({referredby: req.params.id}, {username: 1, createdAt: 1})
        return res.json(referrals)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})

router.get("/stats/:id", async (req, res) => {
    try {
        let userstats = await User.findById(req.params.id)
        let transactions = await Transaction.find({userId: req.params.id})
        return res.json({userstats, transactions: transactions.reverse()})
    } catch (error) {
        console.log(err)
        res.status(500).json(error)
    }
})

module.exports = router