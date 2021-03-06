'use strict';


const express = require('express');
const request = require('request');



// api/cruds
let router = express.Router();

let User = require('../models/user');

let userPopulate = {
  path: 'friends',
  select: '-password -friends'
}



router.get('/profile', User.authorized({ admin: false }), (req, res) => {
  // console.log(req.user);
  res.send(req.user);
});

router.post('/facebook', (req, res) => {
  User.facebook(req.body, (err, token) => {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    }
    res.send({ token: token });
  });
});


router.post('/signup', (req, res) => {
  console.log('req.body:', req.body);
  User.register(req.body, (err, token) => {
    res.status(err ? 400 : 200).send(err || { token: token });
  });
});

router.post('/login', (req, res) => {
  // console.log('req.body:',req.body);
  User.authenticate(req.body, (err, token) => {
    res.status(err ? 400 : 200).send(err || { token: token });
  });
});


//logout a user
router.post('/logout', (req, res) => {
  res.clearCookie('authtoken').send();
});

//add a message

// router.post('/:fromId/sendMessage/:toId', (req, res) => {
//   User.addMessage(req.params.fromId, req.body.message, req.params.toId, (err, response) => {
//     if (err) return res.status(400).send(err);
//     res.send(response);
//   });
// });

//add a friend
router.post('/:userId/addFriend/:friendId', (req, res) => {
  User.addFriend(req.params.userId, req.params.friendId, (err, savedUser) => {
    if (err) return res.status(400).send(err);
    // console.log(savedUser);
    res.send();
  })
})


router.route('/')
  .get(User.authorized({ admin: false }), (req, res) => {
    User
      .find({})
      .select('-password')
      .populate(userPopulate)
      .exec((err, users) => {
        if (err) return res.status(400).send(err);
        res.send(users);
      })
  })
  .post((req, res) => {


    User.create(req.body, (err, savedDoc) => {
      if (err) return res.status(400).send(err);

      res.send(savedDoc);
    });

  });

router.route('/:id')
  .delete((req, res) => {
    User.findByIdAndRemove(req.params.id, (err) => {
      if (err) return res.status(400).send(err);

      res.send();
    });
  })
  .get((req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (err) return res.status(400).send(err);

      res.send(user);
    });
  })
  .put((req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
      if (err) return res.status(400).send(err);

      res.send(user);
    });
  });
module.exports = router;
