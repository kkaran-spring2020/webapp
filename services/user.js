const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');

module.exports = function(app) {
  const { User } = require('../db');
  app.post('/v1/user', async (req, res) => {
    try {
      utils.checkPasswordStrength(req.body.password);
      const password = utils.getPasswordHash(
        req.body.password
      );
      let users = await User.create({
        id: uuidv4.uuid(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password,
        email_address: req.body.email_address
      });
      users = users.toJSON();
      delete users.password;
      res.status(201).send(users);
    } catch (error) {
      let message = null;
      if (error instanceof Sequelize.ValidationError) {
        message = error.errors[0].message;
      }
      res.status(400).send(message || error.toString());
    }
  });

  app.get('/v1/user/self', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);
      user = user.toJSON();
      delete user.password;
      res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });

  app.put('/v1/user/self', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);

      if (req.body.first_name) {
        user.first_name = req.body.first_name;
      }
      if (req.body.last_name) {
        user.last_name = req.body.last_name;
      }
      if (req.body.password) {
        utils.checkPasswordStrength(req.body.password);
        user.password = utils.getPasswordHash(
          req.body.password
        );
      }
      await user.save();
      res.status(204).send();
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });
};
