const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config();



module.exports = function (app) {

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  const { Bill, User, AttachFile } = require('../db');

  app.post('/v2/bill', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);

      let bill = await Bill.create({
        id: uuidv4.uuid(),
        vendor: req.body.vendor,
        bill_date: req.body.bill_date,
        due_date: req.body.due_date,
        amount_due: req.body.amount_due,
        payment_status: req.body.payment_status,
        categories: req.body.categories,
        attachment: {}
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

  app.get('/v2/bills', async (req, res) => {
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
      const id = req.params.id;
      const bills = await user.getBills({
        where: { id: req.params.id }
      });
      if (bills.length == 0) {
        throw new Error('Invalid Bill Id');
      }
      bill = bills[0];

      const file = await AttachFile.findOne({
        where: { BillId: req.params.id }
      });

      const attachment = await Bill.update(
        { attachment: file },
        { where: { id: req.params.id } }
      );

      billTable = bill.dataValues;
      res.status(200).send(billTable);
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
      //karan
      const attachments = await bill.getAttachFile({
        where: { billId: req.params.id }
      });
      console.log("******" + attachments);
      //karan

      if (attachments != null) {


        var details = {
          Bucket: process.env.S3BUCKET,
          Delete: {
            Objects: [
              {
                Key: req.params.id + "_" + attachments.file_name // required
              }
            ],
          },
        };

        s3.deleteObjects(details, function (error, data) {
          if (error) console.log(error, error.stack);
          else console.log('delete', data);
        });
      }

      await user.removeBill(bill);
      await Bill.destroy({
        where: { id: req.params.id }
      });
      //karan
      // const attachments = await bill.getAttachFile({
      //   where: { billId: req.params.id }
      // });
      // console.log("******"+attachments);

      await AttachFile.destroy({
        where: { BillId: req.params.id }
      });



      //karan
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
      if (req.body.amount_due < 0.01) {
        throw new Error("Amount can't be less than 0.01")
      }
      else {
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
