const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type: {type: String},
    amount: {type: Number},
    userId: {type: String},
    approved: {type: Boolean, default: false}
},{
    timestamps: true
})

const Transaction = mongoose.model("Transactions", transactionSchema)

module.exports = Transaction