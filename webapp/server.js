const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const database = require('./db');
const userService = require('./services/user');
const billService = require('./services/bill');
const attachmentService = require('./services/attachFile');
const fileUpload = require('express-fileupload');
const logg = require('./logger');
const SDC = require('statsd-client');
sdc = new SDC({ host: 'localhost', port: 8125 });
database.init();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

userService(app);
billService(app);
attachmentService(app);

var main = app.listen(
  process.env.PORT || 3007,
  function() {
    var port = main.address().port;
    console.log('Running on port: ', port);
    logg.info({ success: 'Running on port: ', port });
  }
);

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    logg.error({ error: 'invalid field'});
    next(err)
});

module.exports = app;

