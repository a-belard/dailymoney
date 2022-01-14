const Notification = require("../models/notificationsModel")
const Transaction = require("../models/transactions")
const User = require("../models/userModel")

const router = require("express").Router()

router.get("/transactions/:userId", async(req,res) => {
    try {
        let {userId} = req.params
        let transactions = await Transaction.find({userId, approved: true})
        return res.json(transactions);
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

router.post("/transactions", async(req,res) => {
    try {
        let {userId, amount, type} = req.body;
        let newTransaction = new Transaction({userId, amount, type})
        await newTransaction.save()
        .then(data => res.json(data), err => {throw err})
        return
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)  
    }
})

router.patch("/transactions", async(req,res) => {
    try {
        let {_id} = req.body
        let transaction = await Transaction.findOne({_id})
        await Transaction.updateOne({_id}, {
            $set: {
                approved: true
            }
        })
        .then(async data => {
            res.json("Approved successfully")
            let newNotification = new Notification({
                type: transaction.type == "deposit" ? "blue" : "dodgerblue",
                userId: transaction.userId,
                content: transaction.type == "deposit" ? "Your account has been topped up with " + transaction.amount + " Trx" : transaction.amount + " Trx have been successfully withdrew from your account!"
            })
            await newNotification.save().then(() => {}, err => {throw err})
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
                            content: "You received " + (transaction.amount * 10 / 100) + " Trx on your balance from the investment of your referral " + user.username,
                        })
                        await newNotification.save().then(() => {}, err => {throw err})
                    })
                }
                await User.updateOne({_id: user._id}, {
                    $set: {
                        totDeposited: user.totDeposited + transaction.amount,
                        activeInvestment: user.activeInvestment + transaction.amount
                    }
                })
                .then(() => {}, err => {throw err})
            }
            else{
                await User.updateOne({_id: user._id}, {
                    $set: {
                        totWithdrew: user.totWithdrew + transaction.amount,
                        balance: 0
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

module.exports = router