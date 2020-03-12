#!/bin/bash
cd /home/ubuntu/webapp
forever stopall
forever start index.js
