const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    count: {type: Number, default: 0}
},{
    timestamps: true
})

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin