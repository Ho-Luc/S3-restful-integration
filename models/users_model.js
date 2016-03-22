'use strict'
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  name: String,
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Files'
  }]
})

module.exports = mongoose.model('Users', usersSchema);
