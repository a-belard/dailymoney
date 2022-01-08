const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    type: {type: String},
    isread: {type: Boolean, default: false},
    content: {type: String},
    userId: {type: String}
},{
    timestamps: true
})

const Notification = mongoose.model("Notifications", notificationSchema)

module.exports = Notification