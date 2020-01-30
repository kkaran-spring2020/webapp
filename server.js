const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const userService = require('./services/user');
const billService = require('./services/bill');
db.init();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

userService(app);
billService(app);

var server = app.listen(
  process.env.PORT || 6000,
  function() {
    var port = server.address().port;
    console.log('Running on port: ', port);
  }
);

module.exports = app;
