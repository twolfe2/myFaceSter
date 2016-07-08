'use strict';


const JWT_SECRET = process.env.JWT_SECRET;

const mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const request = require('request');
console.log(FACEBOOK_SECRET);




// let receivedMessageSchema = new mongoose.Schema({
//   createdAt: { type: Date, default: Date.now },
//   from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   content: { type: String }
// });

let userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  // username: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  facebook: { type: String },
  admin: {type: Boolean, default: false},
  profileImage: { type: String },
  google: { type: String }

});

userSchema.statics.authorized = function(authObj) {


return function(req, res, next) {
  // look at the cookie, and get the token
  // verify the token

  // if token is bad or absent, respond with error (not authorized)
  // if token is good, call next

  let tokenHeader = req.headers.authorization;

  if (!tokenHeader) {
    return res.status(401).send({ error: 'Missing authorization header.' });
  }

  let token = tokenHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).send(err);

    User.findById(payload._id, (err, user) => {
      if (err || !user) return res.status(401).send(err || { error: 'User not found.' });

      //admin check
      if(authObj.admin && !user.admin) {
        return res.status(401).send({error: 'You do not have the correct privileges'});
      }

      req.user = user;

      next();
    });
  });
};
}


userSchema.statics.addFriend = function(userId,friendId,cb) {
  User.findByIdAndUpdate(userId,{$push: {'friends': friendId}}, (err, savedUser) => {
    if(err) cb(err);
    cb(null, savedUser);

  })
}

userSchema.statics.facebook = function(body, cb) {
  console.log(body);
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'location', 'birthday', 'gender', 'picture'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: body.code,
    client_id: body.clientId,
    client_secret: FACEBOOK_SECRET,
    redirect_uri: body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return cb({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return cb({ message: profile.error.message });
      }

      // console.log('profile:',profile);
      // res.send();


      User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) return res.status(400).send(err);

        if (user) {
          //returning user
          let token = user.generateToken();
          //generate the token 
          //send the token
          cb(null, token);
        } else {
          //new user
          let newUser = new User({
            email: profile.email,
            name: profile.name,
            profileImage: profile.picture.data.url,
            facebook: profile.id
          });

          newUser.save((err, savedUser) => {
              if (err) return cb(err);

              let token = savedUser.generateToken();
              cb(null, token);
            })
            //create new user
            //save to db
            //respond with token
        }
      });
    });
  });

}

// userSchema.statics.google = function(body, cb) {
// var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
// var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
// var params = {
//   code: body.code,
//   client_id: body.clientId,
//   client_secret: GOOGLE_SECRET,
//   redirect_uri: body.redirectUri,
//   grant_type: 'authorization_code'
// };

// // Step 1. Exchange authorization code for access token.
// request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
//   var accessToken = token.access_token;
//   var headers = { Authorization: 'Bearer ' + accessToken };

//   // Step 2. Retrieve profile information about the current user.
//   request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
//     if (profile.error) {
//       return res.status(500).send({ message: profile.error.message });
//     }
//     // Step 3a. Link user accounts.
//     if (req.header('Authorization')) {
//       User.findOne({ google: profile.sub }, function(err, existingUser) {
//         if (existingUser) {
//           return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
//         }
//         var token = req.header('Authorization').split(' ')[1];
//         var payload = jwt.decode(token, config.TOKEN_SECRET);
//         User.findById(payload.sub, function(err, user) {
//           if (!user) {
//             return res.status(400).send({ message: 'User not found' });
//           }
//           user.google = profile.sub;
//           user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
//           user.displayName = user.displayName || profile.name;
//           user.save(function() {
//             var token = createJWT(user);
//             res.send({ token: token });
//           });
//         });
//       });
//     } else {
//       // Step 3b. Create a new user account or return an existing one.
//       User.findOne({ google: profile.sub }, function(err, existingUser) {
//         if (existingUser) {
//           return res.send({ token: createJWT(existingUser) });
//         }
//         var user = new User();
//         user.google = profile.sub;
//         user.picture = profile.picture.replace('sz=50', 'sz=200');
//         user.displayName = profile.name;
//         user.save(function(err) {
//           var token = createJWT(user);
//           res.send({ token: token });
//         });
//       });
//     }
//   });
// });
// });



// };



userSchema.methods.generateToken = function() {

  let payload = {
    _id: this._id,
    name: this.name

  };

  let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1 day' });

  return token;

};

userSchema.statics.register = function(userObj, cb) {

  // Check that the username is not taken
  // Create a new user document

  this.findOne({ email: userObj.email }, (err, user) => {
    if (err || user) return cb(err || { error: 'A user with this email already exists.' });

    this.create(userObj, (err, savedUser) => {
      if (err) cb(err);

      let token = savedUser.generateToken();
      cb(null, token);
    });
  });
};

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  bcrypt.hash(this.password, 12, (err, hash) => {
    this.password = hash;
    next();
  });
});

userSchema.statics.authenticate = function(userObj, cb) {

  // try to find user document by username
  // check if username and password match
  // set login state

  this.findOne({ email: userObj.email })
    .exec((err, user) => {
      if (err) return cb(err);

      if (!user) {
        return cb({ error: 'Invalid email or password.' });
      }
      //           ( password attempt,   db hash )
      bcrypt.compare(userObj.password, user.password, (err, isGood) => {
        if (err || !isGood) return cb(err || { error: 'Invalid email or password.' });

        let token = user.generateToken();

        cb(null, token);
      });
    });
};



var User = mongoose.model('User', userSchema);

module.exports = User;
