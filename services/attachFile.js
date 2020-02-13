const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const fs = require('fs');
const mime = require('mime');
var dateformat = require("dateformat");

module.exports = function(app) {
  const { Bill, User, AttachFile } = require('../db');

  app.post('/v1/bill/:id/file', async (req, res) => {
    try {
      let user = await utils.validateAndGetUser(req, User);
      if (
        !req.files ||
        Object.keys(req.files).length === 0 ||
        !req.files.attachment
      ) {
        throw new Error('No files were uploaded.');
      }
      let bills = await user.getBills({
        where: { id: req.params.id }
      });

      bill = bills[0];
      if (bill.length == 0) {
        throw new Error('Invalid Bill Id');
      }
      const attachments = await AttachFile.findAll({
        where: {BillId: req.params.id}
      });

      if( attachments.length !=0) {
        throw  new Error("BillId already exists");
      }
      const uuid = uuidv4.uuid();
      let extension = mime.getExtension(req.files.attachment.mimetype);

      if (extension== 'pdf' || extension == 'jpeg' || extension == 'jpg' || extension == 'png') {

        await req.files.attachment.mv(
            `${__dirname}/../uploads/${req.params.id}${req.files.attachment.name}`
        );

        let fileMetadata = await AttachFile.create({
          id: uuid,
          file_name: req.files.attachment.name,
          mime_type: req.files.attachment.mimetype,
          size: req.files.attachment.size,
          md5: req.files.attachment.md5,
          upload_date: dateformat(new Date(), "yyyy-mm-dd"),
          url: 'uploads' + '/' + req.params.id + req.files.attachment.name
        });

        const fileUpload = {
          id: uuid,
          file_name: req.files.attachment.name,
          url: 'uploads' + '/' + req.params.id + req.files.attachment.name,
          upload_date: dateformat(new Date(), "yyyy-mm-dd")
        };

        await Bill.update(
        {attachment : fileUpload},
        {where: {id: req.params.id}}

        );

        await bill.setAttachFile(fileMetadata);
        res.status(201).send(fileUpload);
      }else{
        throw  new Error("Invalid Extension of attachment");
      }

    } catch (error) {
      let message = null;
      if (error instanceof Sequelize.ValidationError) {
        message = error.errors[0].message;
      }
      res.status(400).send(message || error.toString());
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
          }
          const bill = bills[0];
          const attachments = await bill.AttachFile({
            where: { id: req.params.fileId }
          });

          const fileupload={
            id:req.params.fileId,
            file_name:attachments.file_name,
            url:attachments.url,
            upload_date:dateformat(attachments.upload_date,"yyyy-mm-dd")

          }
          if (attachments.length == 0) {
            throw new Error('Invalid Attachment Id');
          }
          res.status(200).send(fileupload);
        } catch (e) {
          res.status(400).send(e.toString());
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
          }
          const bill = bills[0];
          const attachments = await bill.getAttachFile({
            where: { id: req.params.fileId }
          });
          if (attachments.length == 0) {
            throw new Error('Invalid Attachment Id');
          }
          await fs.promises.unlink(
              `${__dirname}/../uploads/${req.params.billId}${attachments.dataValues.file_name}`
          );

          await AttachFile.destroy({
          where: {BillId: req.params.billId}

          });
          await Bill.update(
              {attachment : { }},
              {where: {id: req.params.billId}}
          );
          res.status(204).send();
        } catch (e) {
          res.status(400).send(e.toString());
        }
    }
  );
};
