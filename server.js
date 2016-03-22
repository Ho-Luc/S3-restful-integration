'use strict'

let express = require('express');
let app = express();
let apiRouter = express.Router();
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
require('./routes/usersRoute')(apiRouter);
require('./routes/filesRoute')(apiRouter);

mongoose.connect('mongodb://localhost/db');
app.use('/', bodyParser.json(), apiRouter, (req, res) => {
})

app.listen(3000, () => {
  console.log('server started on 3000');
})
