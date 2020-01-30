const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');

module.exports = function(app) {
  const { Bill, User } = require('../db');

  app.post('/v1/bill', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);

      let bill = await Bill.create({
        id: uuidv4.uuid(),
        vendor: req.body.vendor,
        bill_date: req.body.bill_date,
        due_date: req.body.due_date,
        amount_due: req.body.amount_due,
        payment_status: req.body.payment_status,
        categories: req.body.categories
      });

      await user.addBill(bill);
      res.status(201).send(bill.toJSON());
    } catch (error) {
      let message = null;
      if (error instanceof Sequelize.ValidationError) {
        message = error.errors[0].message;
      }
      res.status(400).send(message || error.toString());
    }
  });

  app.get('/v1/bills', async (req, res) => {
    try {
      const user = await utils.validateAndGetUser(
        req,
        User
      );
      const bills = await user.getBills();
      res.status(200).send(bills);
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });

  app.get('/v1/bill/:id', async (req, res) => {
    try {
      const user = await utils.validateAndGetUser(
        req,
        User
      );
      const bills = await user.getBills({
        where: { id: req.params.id }
      });
      if (bills.length == 0) {
        throw new Error('Invalid Bill Id');
      }
      res.status(200).send(bills[0]);
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });

  app.delete('/v1/bill/:id', async (req, res) => {
    try {
      const user = await utils.validateAndGetUser(
        req,
        User
      );
      const bills = await user.getBills({
        where: { id: req.params.id }
      });
      if (bills.length == 0) {
        throw new Error('Invalid Bill Id');
      }
      const bill = bills[0];

      await user.removeBill(bill);
      await bill.destroy();
      res.status(204).send();
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });

  app.put('/v1/bill/:id', async (req, res) => {
    try {
      const user = await utils.validateAndGetUser(
        req,
        User
      );
      const bills = await user.getBills({
        where: { id: req.params.id }
      });
      if (bills.length == 0) {
        throw new Error('Invalid Bill Id');
      }
      const bill = bills[0];

      if (req.body.vendor) {
        bill.vendor = req.body.vendor;
      }
      if (req.body.bill_date) {
        bill.bill_date = req.body.bill_date;
      }
      if (req.body.due_date) {
        bill.due_date = req.body.due_date;
      }
      if (req.body.amount_due) {
        bill.amount_due = req.body.amount_due;
      }
      if (req.body.payment_status) {
        bill.payment_status = req.body.payment_status;
      }
      if (req.body.categories) {
        bill.categories = req.body.categories;
      }

      await bill.save();
      res.status(204).send();
    } catch (e) {
      res.status(400).send(e.toString());
    }
  });
};