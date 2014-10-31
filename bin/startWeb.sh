#!/bin/sh
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX web server...
forever start -c 'node -harmony' -o "${doctorX}/log/server.log" ${doctorX}/server.js
echo doctorx web server started!
