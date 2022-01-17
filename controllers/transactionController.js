const Admin = require("../models/adminModel")
const Notification = require("../models/notificationsModel")
const Transaction = require("../models/transactions")
const User = require("../models/userModel")

const router = require("express").Router()



router.get("/stats", async(req,res) => {
    try {
        let transactions = await Transaction.find()
                                    .sort({'updatedAt': -1})
                                    .populate("userId",["username","walletAddress"],"User")
                                    .exec()
        let users = await User.find({verified: true})
        return res.json({transactions: transactions, users: users.length});
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

router.post("/transaction/balance", async (req,res) => {

    try {
    let {userId, amount, type} = req.body;
        let newTransaction
        if(type === "withdraw"){
            let user = await User.findById(userId);
            await User.updateOne({_id: userId}, {
                $set: {
                    totWithdrew: user.totWithdrew + amount,
                    balance: 0,
                }
            })
            .then(() => {}, err => {throw err})
            let newNotification = new Notification({
                type: "dodgerblue",
                userId,
                content: new Intl.NumberFormat().format(amount) + "$ has been successfully withdrew from your account!"
            })
            await newNotification.save().then(() => {}, err => {throw err})
            newTransaction =new Transaction({userId, amount, type, approved: true})
        }
        else {
            newTransaction = new Transaction({userId, amount, type})
        }
        await newTransaction.save()
        .then(data => res.json("Transaction made"), err => {throw err})
        return
    } catch (error) {
        console.log(error)
        return res.status(500).json(error) 
    }
})
router.post("/transactions", async(req,res) => {
    try {
        let {userId, amount, type} = req.body;
        let newTransaction
        if(type === "withdraw"){
            let user = await User.findById(userId);
            await User.updateOne({_id: userId}, {
                $set: {
                    totWithdrew: user.totWithdrew + amount,
                    balanceCount: user.balanceCount + 1
                }
            })
            .then(() => {}, err => {throw err})
            let newNotification = new Notification({
                type: "dodgerblue",
                userId,
                content: new Intl.NumberFormat().format(amount) + "$ has been successfully withdrew from your account!"
            })
            await newNotification.save().then(() => {}, err => {throw err})
            newTransaction =new Transaction({userId, amount, type, approved: true})
        }
        else {
            newTransaction = new Transaction({userId, amount, type})
        }
        await newTransaction.save()
        .then(data => res.json("Transaction made"), err => {throw err})
        return
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)  
    }
})

router.patch("/transaction/:_id", async(req,res) => {
    try {
        let _id = req.params._id
        let transaction = await Transaction.findOne({_id})
        await Transaction.updateOne({_id}, {
            $set: {
                approved: true,
            }
        })
        .then(async data => {
            res.json("Approved successfully")
            let newNotification = new Notification({
                type: transaction.type == "deposit" ? "blue" : "dodgerblue",
                userId: transaction.userId,
                content: transaction.type == "deposit" ? "Your account has been topped up with " + new Intl.NumberFormat().format(transaction.amount) + " $" : transaction.amount + " $ have been successfully withdrew from your account!"
            })
            newNotification.save().then(() => {}, err => {throw err})
            let user = await User.findOne({_id: transaction.userId})
            if(transaction.type == "deposit"){
                if(user.referredby){
                    let referrer = await User.findOne({_id: user.referredby})
                    await User.updateOne({_id: referrer._id}, {
                        $set: {
                            balance: referrer.balance + (transaction.amount * 10 / 100)
                        }
                    })
                    .then(async () => {
                        let newNotification = new Notification({
                            type: "indigo", 
                            userId: referrer.id, 
                            content: "You received " + (transaction.amount * 10 / 100) + " $ on your balance from the investment of your referral " + user.username,
                        })
                        newNotification.save().then(() => {}, err => {throw err})
                    })
                }
                let admin = await Admin.findOne({})
                admin = admin.count
                await User.updateOne({_id: user._id}, {
                    $set: {
                        totDeposited: user.totDeposited + transaction.amount,
                        activeInvestment: user.activeInvestment + transaction.amount,
                        balanceCount: admin
                    }
                })
                .then(() => {}, err => {throw err})
            }
            return
        }, error => {throw error})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)  
    }
})

router.patch("/admin", async (req, res) => {
    try {
        let admin = await Admin.findOne()
        await Admin.updateMany({}, {$set: {count: admin.count + 1}})
        return res.json("Updated")
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get("/admin", async (req, res) => {
    let admin = await Admin.findOne({})
    return res.json(admin.count)
})

router.get("/balances/:count", async (req,res) => {
    let users = await User.find({balanceCount: {$lt: req.params.count}})
    return res.json(users)
})

module.exports = router