const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1",
    accessKeyId: "AKIAWDCQRKLE6YKHILRV",
    secretAccessKey: "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"
});

const app = Consumer.create({
    queueUrl: 'https://sqs.us-east-1.amazonaws.com/714891973760/MyQueue2',
    handleMessage: async (message) => {
        // do some work with `message`
    }
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

app.start();
