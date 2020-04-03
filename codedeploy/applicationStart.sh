#!/bin/bash
cd /home/ubuntu/webapp
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/cloudWatch_config.json -s
forever stopall
forever start server.js
forever start sqs-consumer.js
