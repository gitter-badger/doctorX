#!/bin/sh
echo Run by forever.
echo doctorX root path is [${doctorX}]

#web server
echo starting doctorX web server...
forever start -c 'node -harmony' -o "${doctorX}/log/server.log" ${doctorX}/server.js
echo doctorx web server started!

#IM server
echo starting doctorX IM server...
forever start -c 'node -harmony' -o "${doctorX}/log/IMserver.log" ${doctorX}/server/lib/im/server.js
forever start -c 'node -harmony' -o "${doctorX}/log/IMbase.log" ${doctorX}/server/lib/im/imBase.js
echo doctorx IM server started!

#search engine
echo starting doctorX search engine...
forever start -c 'node -harmony' -o "${doctorX}/log/searchengine.log" ${doctorX}/server/lib/search/indexBuilder.js
echo doctorx search engine started!

#status engine
echo starting doctorX status engine...
forever start -c 'node -harmony' -o "${doctorX}/log/status.offlinelistener.log" ${doctorX}/server/lib/status/statusOfflineDistributor.js
forever start -c 'node -harmony' -o "${doctorX}/log/status.onlinelistener.log" ${doctorX}/server/lib/status/statusOnlineDistributor.js
forever start -c 'node -harmony' -o "${doctorX}/log/status.timelinebuilder.log" ${doctorX}/server/lib/status/statusTimelineBuilder.js
echo doctorx status engine started!
echo You r all set for doctorX!
