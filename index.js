const express = require("express")
const cors = require("cors")
require('dotenv').config()

const app = express()

require("./models/dbConnection")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use(require("./controllers/userContoller"))
app.use(require("./controllers/transactionController"))
app.use(require("./controllers/notificationsController"))

app.listen(process.env.PORT || 5000,() =>  console.log("Server started.."))