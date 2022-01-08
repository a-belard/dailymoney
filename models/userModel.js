const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    names: {type: String},
    email: {type: String},
    phone: {type: String},
    country: {type: String},
    gender: {type: String},
    password: {type: String},
    username: {type: String},
    walletAddress: {type: String},
    balance: {type: Number, default: 0},
    totWithdrew: {type: Number, default: 0},
    totDeposited: {type: Number, default: 0},
    initTime: {type: Date},
    endTime: {type: Date},
    yearStart: {type: Date},
    yearEnd: {type: Date},
    referredBy: {type: String},
    verified: {type: Boolean}
},
{timestamps: true})

mongoose.model("User", userSchema)
let user = mongoose.model("User", userSchema)

module.exports = user