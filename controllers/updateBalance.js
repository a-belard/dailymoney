const User = require("../models/userModel");

module.exports = update = async result => {
    let date = new Date();
    Date.prototype.addDays = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    
    if(date >= result.endTime){
        let endTime = new Date(result.endTime)
        await User.updateOne({username: result.username}, {
            $set: {
                balance: result.balance + (result.activeInvestment * 3 / 100),
                initTime: endTime,
                endTime: result.activeInvestment > 0 ? endTime.addDays(1) : endTime
            }
        })
        .then(()=>{}, err => {throw err})
    }
}