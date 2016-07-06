'use strict';


const express = require('express');



// api/cruds
let router = express.Router();

let User = require('../models/user');




router.get('/profile', User.authMiddleware, (req, res) => {
  res.send(req.user);
})

//register a new user
router.post('/register', (req, res) => {
  console.log(req.body);
  User.register(req.body, err => {
    if (err) return res.status(400).send(err);

    res.send();
  });
});

//login a user

router.post('/login', (req, res) => {
  User.authenticate(req.body, (err, user) => {
    if (err) return res.status(400).send(err);

    let token = user.generateToken();
    res.cookie('authtoken', token).send(user);
  });
});

//logout a user
router.post('/logout', (req, res) => {
  res.clearCookie('authtoken').send();
});

//add a message

router.post('/:fromId/sendMessage/:toId', (req, res) => {
  User.addMessage(req.params.fromId, req.body.message, req.params.toId, (err, response) => {
    if (err) return res.status(400).send(err);
    res.send(response);
  });
});


router.route('/')
  .get((req, res) => {
    User.find({}, (err, user) => {
      if (err) return res.status(400).send(err);
      res.send(user);

    }).select('-password');
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
