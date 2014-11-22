#!/bin/bash
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX IM server...
forever start -c 'node -harmony' -o "${doctorX}/logs/IMserver.log" ${doctorX}/server/lib/im/server.js
forever start -c 'node -harmony' -o "${doctorX}/logs/IMbase.log" ${doctorX}/server/lib/im/imBase.js
echo doctorx IM server started!
