'use strict';
require('dotenv').config();

const PORT = process.env.PORT || 8000;

let express = require('express');
let http = require('http');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');


let app = express();

//Database setup
let mongoose = require('mongoose');

let mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost/socialApp';

mongoose.connect(mongoUrl, err => {
  console.log(err ||  `MongoDB connected at ${mongoUrl}`);
})


let server = http.createServer(app);

server.listen(PORT, err => {
  console.log(err || `Server listening on port: ${PORT}`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

///// ROUTERS ///////

app.use('/api', require('./routes/api'));

//////////////////////

app.get('/', (req,res) => {
  res.render('index', {title: 'Hello World!'});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err);
});



