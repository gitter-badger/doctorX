#!/bin/sh
echo Run by forever.
echo doctorX root path is [${doctorX}]
echo starting doctorX search engine...
forever start -c 'node -harmony' -o "${doctorX}/log/searchengine.log" ${doctorX}/server/lib/search/indexBuilder.js
echo doctorx search engine started!
