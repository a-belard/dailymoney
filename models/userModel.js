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
    referredby: {type: String},
    verified: {type: Boolean},
    referrals: {type: Array},
    balanceCount: {type: Number, default: 0},
    activeInvestment: {type: Number, default: 0}
},
{timestamps: true})

module.exports = User = mongoose.model("User", userSchema)



