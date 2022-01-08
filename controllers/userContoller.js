const router = require("express").Router()
const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken");
const AdminNotification = require("../models/adminNotificationModel");
const Notification = require("../models/notificationsModel");
const updateBalance = require("./updateBalance");
const { sendEmail } = require("../utils/sendEmail");
const req = require("express/lib/request");

let date = new Date();
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

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
        .then(async (data) => {
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
                            Please click the below button for your verification!
                        </h4>
                        <div style="width: 120px; height:50px; background-color:dodgerblue; border-radius:7px; display:flex;justify-items:center;align-items:center"><a href="https://dailymoneybusiness.herokuapp.com/verified/${data._id}" style="text-decoration: none; padding: 15px 40px; border-radius: 7px; font-weight: bold; background-color: dodgerblue; color: white;"><strong>APPROVE</strong></a></div>
                    </div>
                `
            }
            sendEmail(options);
            res.json("User registerd successfully")
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

router.get("/verified/:id", async (req,res) => {
    try {
        let user = await User.findOne({"_id": req.params.id})
        await User.updateOne({_id: user._id}, {
            $set: {
                verified: true
            }
        })
        let newNotification = new AdminNotification({
                type: "green",
                content: user.username + " signed up!",
            })
            await newNotification.save()
            .then(()=>{}, err => {throw err})

            if(user.referredby){
                await User.updateOne({referredby: user.referredBy},{
                    $push: {
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
            return res.redirect("https://google.com")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
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

module.exports = router