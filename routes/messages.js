'use strict';


const express = require('express');



// api/cruds
let router = express.Router();

let Message = require('../models/message');
let User = require('../models/user');


// router.post('/:fromId/sendMessage/:toId', (req,res) => {
//   message.addMessage(req.params.fromId, req.body.message, req.params.toId, (err, response) => {
//     if(err) return res.status(400).send(err);
//     res.send(response);
//   });
// });



router.get('/sentMessages/:fromId', User.authorized({admin: false}), (req, res) => {
  Message.find({ from: req.params.fromId }, (err, messages) => {
    if (err) return res.status(400).send(err);
    res.send(messages);
  });
});


router.get('/recievedMessages/:toId', User.authorized({admin: false}), (req, res) => {
  Message.find({ to: req.params.toId }, (err, messages) => {
    if (err) return res.status(400).send(err);
    res.send(messages);
  });
});

router.post('/:fromId/sendMessage/:toId', User.authorized({admin: false}), (req,res) => {
  User.findById(req.params.toId, (err, user) => {
    if(err || !user) return res.status(400).send(err || {error: 'The user you are trying to send a message to does not exist.'});
    let message = {
      to: req.params.toId,
      from: req.params.fromId,
      content: req.body.content
    };
    Message.create(message, (err, savedMessage) => {
      if (err) return res.status(400).send(err);
      res.send(savedMessage);
    });
  });
});

//   .post((req,res) => {


//     Message.create(req.body, (err, savedDoc) => {
//       if(err) return res.status(400).send(err);

//       res.send(savedDoc);
//     });

// });

// router.route('/:id')
//   .delete((req,res) => {
//     Message.findByIdAndRemove(req.params.id, (err) => {
//       if(err) return res.status(400).send(err);

//       res.send();
//     });
//   })
//   .get((req,res) => {
//     Message.findById(req.params.id, (err, message) => {
//       if(err) return res.status(400).send(err);

//       res.send(message);
//     });
//   })
//   .put((req, res) => {
//     Message.findByIdAndUpdate(req.params.id, req.body,{new: true}, (err, message) => {
//       if(err) return res.status(400).send(err);

//       res.send(message);
//     });
//   });
module.exports = router;
