'use strict'
const mongoose = require('mongoose');

const filesSchema = new mongoose.Schema({
  filename: String,
  url: String
})

module.exports = mongoose.model('Files', filesSchema);
