const User = require("../models/userModel");

module.exports = update = async result => {
    let date = new Date();
    Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
    }

    if(date >= result.endTime){
        let endTime = new Date(result.endTime)
        await User.updateOne({username: result.username}, {
            $set: {
                balance: result.balance + (result.totDeposited * 3 / 100),
                initTime: endTime,
                endTime: endTime.addDays(1)
            }
        })
        .then(()=>{}, err => {throw err})
    }
}