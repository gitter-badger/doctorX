'use strict';
var _ = require('underscore');
var redis = require('redis');
var sub = redis.createClient();
var pub = redis.createClient();
sub.select(9);
pub.select(8);

sub.subscribe('status-channel');
sub.on('subscribe', function(channel, message) {
  console.log('[status Online Distributor] start to listening new statuses @', channel, '...');
});

sub.on('message', function(channel, message) {
  console.log(channel, message);

  // distribute statuses to Redis[8] pubsub channel: "public"
  // message.room ---- message.contentIds

  try {
    var status = JSON.parse(message);
    if (!isPublic(status.sharedGroups, status.sharedUsers)) {
      return
    } else {
      pub.publish('public', message);
    }
  } catch (err) {
    console.error('statusOnlineDistributor error', err);
  }
});

var isPublic = function(groups, users) {
  if ((groups && _.contains(groups, 'onlyme')) || (users && _.contains(users, 'onlyme')) ) {
    // only send to myself
    return false;
  };
  if (groups && _.contains(groups, 'public')) {
    // send to whoever follow me
    return true;
  }
  return false;
}