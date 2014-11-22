#!/bin/bash
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX status engine...
forever start -c 'node -harmony' -o "${doctorX}/logs/status.offlinelistener.log" ${doctorX}/server/lib/status/statusOfflineDistributor.js
forever start -c 'node -harmony' -o "${doctorX}/logs/status.onlinelistener.log" ${doctorX}/server/lib/status/statusOnlineDistributor.js
forever start -c 'node -harmony' -o "${doctorX}/logs/status.timelinebuilder.log" ${doctorX}/server/lib/status/statusTimelineBuilder.js
echo doctorx status engine started!
