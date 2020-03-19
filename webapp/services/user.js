const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
var logg = require('../logger');
const SDC = require('statsd-client');
sdc = new SDC({ host: 'localhost', port: 8125 });
module.exports = function (app) {
  const { User } = require('../db');
  app.post('/v1/user', async (req, res) => {
    try {
      logger.info("User POST Method Call");
      sdc.increment('POST User');
      utils.PasswordStrength(req.body.password);
      const hash = await bcrypt.hash(req.body.password, 10);

      let users = await User.create({
        id: uuidv4.uuid(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hash,
        email_address: req.body.email_address
      });
      users = users.toJSON();
      delete users.password;
      res.status(201).send(users);
      logg.info({ success: "success" });
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
      logger.info("User GET Method Call");
      sdc.increment('GET User');
      let user = await utils.validateAndGetUser(req, User);
      user = user.toJSON();
      delete user.password;
      res.status(200).send(user);
      logg.info({ success: "success" });
    } catch (e) {
      res.status(400).send(e.toString());
      logg.error({ error: e.toString() });
    }
  });

  app.put('/v1/user/self', async (req, res) => {
    try {
      logger.info("User PUT Method Call");
      sdc.increment('Update User');
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
      res.status(204).send();
      logg.info({ success: "success" });
    } catch (e) {
      res.status(400).send(e.toString());
      logg.error({ error: e.toString() });
    }
  });
};
