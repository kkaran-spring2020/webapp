const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
var logg = require('../logger');
const SDC = require('statsd-client');
sdc = new SDC({ host: 'localhost', port: 8125 });
module.exports = function (app) {
  const { User } = require('../db');
    app.get('/', async (req,res)=>{
    res.status(200).json({
      "message":"Hello... Today's date is : "+new Date()
    });
  });
  app.post('/v1/user', async (req, res) => {
    try {
      var startDate_db = new Date();
      logg.info("User POST Method Call");
      sdc.increment('POST User');
      utils.PasswordStrength(req.body.password);
      const hash = await bcrypt.hash(req.body.password, 10);
      var startDate_db = new Date();
      let users = await User.create({
        id: uuidv4.uuid(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hash,
        email_address: req.body.email_address
      });
      var endDate_db = new Date();
      var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
      sdc.timing('api-time-post-user-db', seconds_db);
      users = users.toJSON();
      delete users.password;
      res.status(201).send(users);
      logg.info({ success: "success" });
      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
      sdc.timing('api-time-post-user', seconds);
    } catch (error) {
      let message = null;
      if (error instanceof Sequelize.ValidationError) {
        message = error.errors[0].message;
      }
      res.status(400).send(message || error.toString());
      logg.error({ error: e.toString() });
    }
  });

  app.get('/v1/user/self', async (req, res) => {
    try {
      var startDate = new Date();
      logg.info("User GET Method Call");
      sdc.increment('GET User');
      var startDate_db = new Date();
      let user = await utils.validateAndGetUser(req, User);
      user = user.toJSON();
      delete user.password;
      var endDate_db = new Date();
      var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
      sdc.timing('api-time-get-user-db', seconds_db);
      res.status(200).send(user);
      logg.info({ success: "success" });
      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
      sdc.timing('api-time-get-user', seconds);

    } catch (e) {
      res.status(400).send(e.toString());
      logg.error({ error: e.toString() });
    }
  });

  app.put('/v1/user/self', async (req, res) => {
    try {
      var startDate = new Date();
      logg.info("User PUT Method Call");
      sdc.increment('Update User');
      var startDate_db = new Date();
      let user = await utils.validateAndGetUser(req, User);

      if (req.body.first_name) {
        user.first_name = req.body.first_name;
      }
      if (req.body.last_name) {
        user.last_name = req.body.last_name;
      }
      if (req.body.password) {
        utils.PasswordStrength(req.body.password);
        user.password = await bcrypt.hash(req.body.password, 10);

      }
      await user.save();
      var endDate_db = new Date();
      var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
      sdc.timing('api-time-put-user-db', seconds_db);
      res.status(204).send();
      logg.info({ success: "success" });
      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
      sdc.timing('api-time-put-user', seconds);
    } catch (e) {
      res.status(400).send(e.toString());
      logg.error({ error: e.toString() });
    }
  });
};
