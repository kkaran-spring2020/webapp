const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const fs = require('fs');
const mime = require('mime');
const AWS = require('aws-sdk')
require('dotenv').config();
var dateformat = require("dateformat");
var logg = require('../logger');



module.exports = function (app) {

  const { Bill, User, AttachFile } = require('../db');

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });


  app.post('/v1/bill/:id/file', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);
      if (
        !req.files ||
        Object.keys(req.files).length === 0 ||
        !req.files.attachment
      ) {
        throw new Error('No files were uploaded.');
        logg.error({ error: 'No files were uploaded.' });
      }
      let bills = await user.getBills({
        where: { id: req.params.id }
      });

      bill = bills[0];
      if (bill.length == 0) {
        throw new Error('Invalid Bill Id');
        logg.error({ error: 'Invalid Bill Id' });
      }
      const attachments = await AttachFile.findAll({
        where: { BillId: req.params.id }
      });

      if (attachments.length != 0) {
        throw new Error("BillId already exists");
        logg.error({ error: 'BillId already exists' });
      }
      const uuid = uuidv4.uuid();
      let extension = mime.getExtension(req.files.attachment.mimetype);

      if (extension == 'pdf' || extension == 'jpeg' || extension == 'jpg' || extension == 'png') {

        params = {
          Bucket: process.env.S3BUCKET,
          Key: req.params.id + "_" + req.files.attachment.name,
          Body: JSON.stringify(req.files.attachment)
        };


        s3.putObject(params, function (err, data) {
          if (err) {
            console.log(err)
            logg.error({ error: err});
          } else {
            console.log("Successfully uploaded data to Bucket/Key");
            logg.info({ success: "Successfully uploaded data to Bucket/Key" });
          }

        });

        // await req.files.attachment.mv(
        //     `${__dirname}/../uploads/${req.params.id}${req.files.attachment.name}`
        // );

        let fileMetadata = await AttachFile.create({
          id: uuid,
          file_name: req.files.attachment.name,
          mime_type: req.files.attachment.mimetype,
          size: req.files.attachment.size,
          md5: req.files.attachment.md5,
          upload_date: dateformat(new Date(), "yyyy-mm-dd"),
          url: "https://" + process.env.S3BUCKET + ".s3.amazonaws.com" + "/" + req.params.id + "_" + req.files.attachment.name
        });

        const fileUpload = {
          id: uuid,
          file_name: req.files.attachment.name,
          url: "https://" + process.env.S3_BUCKET_NAME + ".s3.amazonaws.com" + "/" + req.params.id + "_" + req.files.attachment.name,
          upload_date: dateformat(new Date(), "yyyy-mm-dd")
        };

        await Bill.update(
          { attachment: fileUpload },
          { where: { id: req.params.id } }

        );

        await bill.setAttachFile(fileMetadata);
        res.status(201).send(fileUpload);
        logg.info({ success: "success" });
      } else {
        throw new Error("Invalid Extension of attachment");
        logg.error({ error: 'Invalid Extension of attachment' });
      }

    } catch (error) {
      let message = null;
      if (error instanceof Sequelize.ValidationError) {
        message = error.errors[0].message;
      }
      res.status(400).send(message || error.toString());
      logg.error({ error: message || error.toString() });
    }
  });

  app.get(
    '/v1/bill/:billId/file/:fileId',
    async (req, res) => {
      try {
        const user = await utils.validateAndGetUser(
          req,
          User
        );
        const bills = await user.getBills({
          where: { id: req.params.billId }
        });
        if (bills.length == 0) {
          throw new Error('Invalid Bill Id');
          logg.error({ error: 'Invalid Bill Id'});
        }
        const bill = bills[0];
        const attachments = await bill.getAttachFile({
          where: { id: req.params.fileId }
        });

        const fileupload = {
          id: req.params.fileId,
          file_name: attachments.file_name,
          url: attachments.url,
          upload_date: dateformat(attachments.upload_date, "yyyy-mm-dd")

        }
        if (attachments.length == 0) {
          throw new Error('Invalid Attachment Id');
          logg.error({ error: 'Invalid Attachment Id' });
        }
        res.status(200).send(fileupload);
        logg.info({ success: "success" });
      } catch (e) {
        res.status(400).send(e.toString());
        logg.error({ error: e.toString() });
      }
    }
  );

  app.delete(
    '/v1/bill/:billId/file/:fileId',
    async (req, res) => {
      try {
        const user = await utils.validateAndGetUser(
          req,
          User
        );
        const bills = await user.getBills({
          where: { id: req.params.billId }
        });
        if (bills.length == 0) {
          throw new Error('Invalid Bill Id');
          logg.error({ error: 'Invalid Bill Id' });
        }
        const bill = bills[0];
        const attachments = await bill.getAttachFile({
          where: { id: req.params.fileId }
        });
        if (attachments.length == 0) {
          throw new Error('Invalid Attachment Id');
          logg.error({ error: 'Invalid Attachment Id' });
        }

        var params = {
          Bucket: process.env.S3BUCKET,
          Delete: {
            Objects: [
              {
                Key: req.params.billId + "_" + attachments.file_name // required
              }
            ],
          },
        };

        s3.deleteObjects(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else console.log('delete', data);
          if (error) logg.error({ error: error });
        });

        await AttachFile.destroy({
          where: { BillId: req.params.billId }

        });
        await Bill.update(
          { attachment: {} },
          { where: { id: req.params.billId } }
        );
        res.status(204).send();
        logg.info({ success: "success" });
      } catch (e) {
        res.status(400).send(e.toString());
        logg.error({ error: e.toString() });
      }
    }
  );
};
