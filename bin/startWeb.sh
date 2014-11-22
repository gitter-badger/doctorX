#!/bin/bash
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX web server...
forever start -c 'node -harmony' -o "${doctorX}/logs/server.log" ${doctorX}/server.js
echo doctorx web server started!
