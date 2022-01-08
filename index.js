const express = require("express")
const cors = require("cors")
require('dotenv').config()

const app = express()

require("./models/dbConnection")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use(require("./controllers/contoller"))

app.listen(process.env.PORT || 5000,() =>  console.log("Server started.."))