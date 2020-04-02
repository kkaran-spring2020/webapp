const Sequelize = require('sequelize');
const utils = require('../utils');
const uuidv4 = require('uuidv4');
const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config();
var logg = require('../logger');
const SDC = require('statsd-client');
sdc = new SDC({ host: 'localhost', port: 8125 });

module.exports = function (app) {

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const { Bill, User, AttachFile } = require('../db');

    app.post('/v1/bill', async (req, res) => {
        try {
            var startDate = new Date();
            logg.info("Bill POST Method Call");
            sdc.increment('POST Bill');
            let user = await utils.validateAndGetUser(req, User);
            var startDate_db = new Date();
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
            var endDate_db = new Date();
            var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
            sdc.timing('api-time-post-bill-db', seconds_db);
            res.status(201).send(bill.toJSON());
            logg.info({ success: "success" });
            var endDate = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            sdc.timing('api-time-post-bill', seconds);
        } catch (error) {
            let message = null;
            if (error instanceof Sequelize.ValidationError) {
                message = error.errors[0].message;
            }
            res.status(400).send(message || error.toString());
            logg.error({ error: e.toString() });
        }
    });

    app.get('/v1/bills', async (req, res) => {
        try {
            var startDate = new Date();
            logg.info("Bill GET Method Call");
            sdc.increment('GET all Bills');
            var startDate_db = new Date();
            const user = await utils.validateAndGetUser(
                req,
                User
            );

            const bills = await user.getBills();
            var endDate_db = new Date();
            var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
            sdc.timing('api-time-getall-bills-db', seconds_db);

            res.status(200).send(bills);
            logg.info({ success: "success" });
            var endDate = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            sdc.timing('api-time-getall-bills', seconds);

        } catch (e) {
            res.status(400).send(e.toString());
            logg.error({ error: e.toString() });
        }
    });

    app.get('/v1/bill/:id', async (req, res) => {
        try {
            var startDate = new Date();
            logg.info("Bill GET Method Call");
            sdc.increment('GET Bill');
            var startDate_db = new Date();
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
                logg.error({ error: 'Invalid Bill Id' });
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
            var endDate_db = new Date();
            var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
            sdc.timing('api-time-get-bill-db', seconds_db);
            res.status(200).send(billTable);
            logg.info({ success: "success" });
            var endDate = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            sdc.timing('api-time-get-bill', seconds);
        } catch (e) {
            res.status(400).send(e.toString());
            logg.error({ error: e.toString() });
        }
    });

    app.delete('/v1/bill/:id', async (req, res) => {
        try {
            var startDate = new Date();
            logg.info("Bill DELETE Method Call");
            sdc.increment('DELETE Bills');
            var startDate_db = new Date();
            const user = await utils.validateAndGetUser(
                req,
                User
            );
            const bills = await user.getBills({
                where: { id: req.params.id }
            });
            if (bills.length == 0) {
                throw new Error('Invalid Bill Id');
                logg.error({ error: 'Invalid Bill Id' });
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
                var startDate_s3 = new Date();
                s3.deleteObjects(details, function (error, data) {
                    if (error) console.log(error, error.stack);
                    else console.log('delete', data);
                    if (error) logg.error({ error: error });
                });
                var endDate_s3 = new Date();
                var seconds_s3 = (endDate_s3.getTime() - startDate_s3.getTime()) / 1000;
                sdc.timing('api-time-delete-bill', seconds_s3);
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

            var endDate_db = new Date();
            var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
            sdc.timing('api-time-delete-bill-db', seconds_db);

            //karan
            res.status(204).send();
            logg.info({ success: "success" });
            var endDate = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            sdc.timing('api-time-delete-bill', seconds);
        } catch (e) {
            res.status(400).send(e.toString());
            logg.error({ error: e.toString() });
        }
    });

    app.put('/v1/bill/:id', async (req, res) => {
        try {
            var startDate = new Date();
            logg.info("Bill PUT Method Call");
            sdc.increment('UPDATE Bill');
            var startDate_db = new Date();
            const user = await utils.validateAndGetUser(
                req,
                User
            );
            const bills = await user.getBills({
                where: { id: req.params.id }
            });
            if (bills.length == 0) {
                throw new Error('Invalid Bill Id');
                logg.error({ error: 'Invalid Bill Id' });
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
                logg.error({ error: 'Amount cant be less than 0.01' });
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
            var endDate_db = new Date();
            var seconds_db = (endDate_db.getTime() - startDate_db.getTime()) / 1000;
            sdc.timing('api-time-put-bill-db', seconds_db);
            res.status(204).send();
            logg.info({ success: "success" });
            var endDate = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            sdc.timing('api-time-put-bill', seconds);
        } catch (e) {
            res.status(400).send(e.toString());
            logg.error({ error: e.toString() });
        }
    });
    app.get('/v1/bills/due/:x', async (req, res) => {
        let x = req.params.x;
        try {
            //validating the user
            const user = await pv.validateUser(
                req,
                User
            );
            //nn
            function formatDate(date) {
                var d = new Date(date),
                    month = "" + (d.getMonth() + 1),
                    day = "" + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) month = "0" + month;
                if (day.length < 2) day = "0" + day;

                return [year, month, day].join("-");
            }

            var d = new Date();
            console.log("Current Date :" + d);
            var new_date = new Date().setDate(
                new Date().getDate() + Number(req.params.x)
            );
            var formatted_date = formatDate(new_date);
            console.log("Bills Before Date: ", formatted_date);


            //k
            const bills = await user.getBills();
            bill = JSON.parse(JSON.stringify(bills));
            console.log(bill);
            Response_Msg = [];
            for (const i in bill) {
                console.log(bill[i].due_date);
                if (bill[i].due_date < formatted_date) {
                    const message = { url: "http://prod.karan1908.me/v1/bill/" + bill[i].id };
                    Response_Msg.push(message);
                }

            }
            const Response = {
                Response_Msg: Response_Msg,
                Response_email: user.email_address,
                Response_due_date: formatted_date
            };

            var send_queue_params = {
                MessageBody: JSON.stringify(Response),
                QueueUrl: 'https://sqs.us-east-1.amazonaws.com/418928218825/MyQueue',
                DelaySeconds: 0
            };

            sqs.sendMessage(send_queue_params, function (error3, data) {
                if (error3) {
                    console.error(error3);
                } else {
                    console.log(
                        "Sent Message From Queue" + JSON.stringify(data)
                    );
                }
            });

            console.log("Response: " + JSON.stringify(Response));
            //res.status(200).send(JSON.stringify(Response));
            res.status(200).send("Check Your Emails for Due Bills");


            var receive_queue_params = {
                QueueUrl: 'https://sqs.us-east-1.amazonaws.com/418928218825/MyQueue1',
                VisibilityTimeout: 0 // 0 min wait time for anyone else to process.
            };
            sqs.receiveMessage(receive_queue_params, function (
                error4,
                data2
            ) {
                if (error4) {
                    console.error(error4);
                } else {
                    console.log(
                        "Recived Message From Queue" + JSON.stringify(data2)
                    );

                    var params = {
                        Message: JSON.stringify(data2) /* required */,
                        TopicArn: 'arn:aws:sns:us-east-1:418928218825:csye62251-SNSTopic-6848RKPJ7ZZ7'
                    };

                    // Create promise and SNS service object
                    var publishTextPromise = new AWS.SNS({
                        apiVersion: "2010-03-31"
                    })
                        .publish(params)
                        .promise();

                    // Handle promise's fulfilled/rejected states
                    publishTextPromise
                        .then(function (data) {
                            console.log(
                                `Message ${params.Message} send sent to the topic ${params.TopicArn}`
                            );
                            console.log("MessageID is " + JSON.stringify(data));
                        })
                        .catch(function (err) {
                            console.error(err, err.stack);
                        });
                }
            });

        } catch (e) {
            res.status(400).send(e.toString());
            logg.error({ error: e.toString() });
        }
    });
};
