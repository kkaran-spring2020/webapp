const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const database = require('./db');
const userService = require('./services/user');
const billService = require('./services/bill');
const attachmentService = require('./services/attachFile');
const fileUpload = require('express-fileupload');

database.init();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

userService(app);
billService(app);
attachmentService(app);

var main = app.listen(
  process.env.PORT || 3006,
  function() {
    var port = main.address().port;
    console.log('Running on port: ', port);
  }
);

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})

module.exports = app;


