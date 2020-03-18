const winston = require('winston');
const cloudWatchTransport = require('winston-aws-cloudwatch');
winston.loggers.add('error-log', {
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true,
            level: 'info'
        }),
        (new cloudWatchTransport({
            logGroupName: 'demo',
            logStreamName: 'log-' + new Date().toISOString().split('T')[0],
            createLogGroup: true,
            createLogStream: true,
            submissionInterval: 2000,
            submissionRetryCount: 1,
            batchSize: 20,
            awsConfig: {
                region: 'us-east-1',
                accessKeyId: 'AKIA2PMB67KOZGGZYBSK',
                secretAccessKey: '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'
            },
            formatLog: function (item: any) {
                return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta);
            }
        })
        )
    ]
});

const logg = winston.loggers.get('error-log');
