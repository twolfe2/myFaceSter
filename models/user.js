'use strict';


const JWT_SECRET = process.env.JWT_SECRET;

const mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');

// let sentMessageSchema = new mongoose.Schema({
//   createdAt: { type: Date, default: Date.now },
//   to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   content: { type: String }
// });

// let receivedMessageSchema = new mongoose.Schema({
//   createdAt: { type: Date, default: Date.now },
//   from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   content: { type: String }
// });

let userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  Profile: {
    name: { type: String, required: true },
    image: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
});


//add the message to each users appropriate array
// userSchema.statics.addMessage = function(fromId, message, toId, cb) {
//   User.findById(fromId, (err, user) => {
//     if (err || !user) return res.status(401).send(err || { error: 'User not found.' });
//     let message = {
//       to: toId,
//       content: message
//     };
//     user.Profile.sentMessages.push(message);

//     user.save((err, savedUser) => {
//       if (err) return cb(err);

//       User.findById(toId, (err, user) => {
//         if (err || !user) return res.status(401).send(err || { error: 'User not found.' });
//         let toMessage = {
//           from: fromId,
//           content: message
//         };

//         user.Profile.receivedMessages.push(message);

//         user.save((err, savedUser) => {
//           if (err) return cb(err);
//           cb('Message added', err);
//         });
//       });
//     });
//   });
// };

userSchema.statics.authMiddleware = function(req, res, next) {

  let token = req.cookies.authtoken;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).send(err);
    console.log(payload);
    User.findById(payload._id, (err, user) => {
      if (err || !user) return res.status(401).send(err || { error: 'User not found.' });

      req.user = user;
      next();
    }).select('-password');
  });
};

userSchema.methods.generateToken = function() {
  let payload = {
    _id: this._id,
    Profile: this.Profile
  };

  let token = jwt.sign(payload, JWT_SECRET);
  return token;
}


userSchema.statics.register = function(userObj, cb) {
  this.findOne({ username: userObj.username }, (err, user) => {
    if (err || user) return cb(err || { error: 'Username already taken.' });

    bcrypt.hash(userObj.password, 12, (err, hash) => {
      if (err) return cb(err);

      userObj.password = hash;

      this.create(userObj, err => {
        cb(err);
      });
    });
  });
};

userSchema.statics.authenticate = function(userObj, cb) {

  this.findOne({ username: userObj.username }, (err, user) => {
    if (err) return cb(err);

    if (!user) {
      return cb({ error: 'Invalid username or password.' });
    }

    bcrypt.compare(userObj.password, user.password, (err, result) => {
      if (err || !result) return cb(err || { error: 'Invalid username or password' });

      user.password = null;

      cb(null, user);
    });
  });
};



var User = mongoose.model('User', userSchema);

module.exports = User;
