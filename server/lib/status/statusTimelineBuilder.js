'use strict';

var redis = require('redis');
var sub = redis.createClient();
var tlStore = redis.createClient();

sub.select(9);
// redis db-[2] for timeline store
tlStore.select('2');

var thunkify = require('thunkify');
var _ = require('underscore');
var co = require('co');

require('../user/schema');
var userFn = require('../user/fn');

sub.subscribe('status-channel');
sub.on('subscribe', function(channel, message) {
  console.log('[Status Timeline Builder] start to listening new statuses @', channel, '...', message);
});

sub.on('message', function(channel, message) {
  console.log(channel, message);
  try {
    var status = JSON.parse(message);
    co(persistTimeline)(status);
  } catch (err) {
    console.error('status timeline-builder err', err);
  }
});


var persistTimeline = function *(status) {
  try {
    var me = status.owner;
    var groups = status.sharedGroups;
    var users = status.sharedUsers;
    var score = (new Date(status.created)).getTime();

    if (!groups) {
      groups = [];
    }

    if (!users) {
      users = [];
    }

    var multi = tlStore.multi();
    multi.zadd('statuses:u:' + me + '-timeline', score, status._id);

    // reserved keywords priority: 'onlyme' > 'public' > 'friends'

    if ((groups && _.contains(groups, 'onlyme')) || (users && _.contains(users, 'onlyme')) ) {
      multi.zadd('statuses:u:' + me + '-timeline-me', score, status._id);
      multi.exec();
      return;
    }

    if (groups && _.contains(groups, 'public')) {
      multi.zadd('statuses:u:' + me + '-timeline-public', score, status._id);
      multi.exec();
      return;
    }

    if (groups && _.contains(groups, 'friends')) {
      multi.zadd('statuses:u:' + me + '-timeline-friends', score, status._id);
      multi.exec();
      return;
    }

    for (var i = 0; i < groups.length; i++) {
      multi.zadd('statuses:u:' + me + '-timeline-g:' + groups[i], score, status._id);
    }

    for (var i = 0; i < users.length; i++) {
      multi.zadd('statuses:u:' + me + '-timeline-u:' + users[i], score, status._id);
    }

    multi.exec();

  } catch (err) {
    console.error('Timeline persist err', err);
  }
}