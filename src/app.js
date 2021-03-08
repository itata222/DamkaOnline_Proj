const express = require('express')
const cors = require('cors')
const path = require('path')

require('./db/mongoose')

const app = express();

const damkaRouter = require('./routes/damka-routes')

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(cors());
app.use(express.json())
app.use(damkaRouter)

module.exports = app

