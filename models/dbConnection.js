const mongoose = require("mongoose");

const URI = process.env.mongo_URI || "mongodb://localhost/dailymoney"

mongoose.connect(URI, {
    keepAlive: true,
    useNewUrlParser:true, 
    useUnifiedTopology:true,
    })
    .then(() => console.log("MongoDB connection established successfully"))
    .catch(err => console.log(err));

require("./userModel");
