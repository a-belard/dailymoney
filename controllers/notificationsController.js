const AdminNotification = require("../models/adminNotificationModel")
const Notification = require("../models/notificationsModel")
const User = require("../models/userModel")

const router = require("express").Router()

router.get("/notifications/:id", async (req,res) => {
    try {
        let notifs = await Notification.find({userId: req.params.id})
        return res.json(notifs.reverse())
    } catch (error) {
        console.log(error)
        res.status(500).json(err)
    } 
})

router.get("/notifications", async (req,res) => {
    try {
        let notifs = await AdminNotification.find()
        return res.json(notifs)
    } catch (error) {
        console.log(error)
        res.status(500).json(err)
    } 
})

router.patch("/notification/:id", async(req,res) => {
    try {
        let notif = await Notification.findOne({_id: req.params.id})
        let adminNotif = await AdminNotification.findOne({_id: req.params.id}) 

        if(notif){
            await Notification.updateOne({_id: notif._id}, {
                $set: {
                    isread: true
                }
            })
            .then(() => {}, err => {throw err})
        }
        if(adminNotif){
            await AdminNotification.updateOne({_id: adminNotif._id}, {
                $set: {
                    isread: true
                }
            }).then(() => res.json("Read"), err => {throw err})
        }
        return res.status("Read")
    } catch (error) {
        console.log(error)
        res.status(500).json(err)
    }
})

router.delete("/notification/:id", async (req,res) => {
    try {
        await Notification.deleteMany({_id: req.params.id})
        .then(() => {}, err => {throw err})
        await AdminNotification.deleteMany({_id: req.params.id})
        .then(() => {}, err => {throw err})
        return res.json("Deleted")
    } catch (error) {
        console.log(error)
        res.status(500).json(err)
    }
})

module.exports = router