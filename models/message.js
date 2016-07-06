'use strict';


const JWT_SECRET = process.env.JWT_SECRET;

const mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');

let messageSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String }
});


var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
