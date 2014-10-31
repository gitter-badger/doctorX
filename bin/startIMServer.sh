#!/bin/sh
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX IM server...
forever start -c 'node -harmony' -o "${doctorX}/log/IMserver.log" ${doctorX}/server/lib/im/server.js
forever start -c 'node -harmony' -o "${doctorX}/log/IMbase.log" ${doctorX}/server/lib/im/imBase.js
echo doctorx IM server started!
