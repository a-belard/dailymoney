const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    type: {type: String},
    isread: {type: Boolean, default: false},
    content: {type: String}
}, {
    timestamps: true
})

const AdminNotification = mongoose.model("AdminNotifications", notificationSchema)

module.exports = AdminNotification