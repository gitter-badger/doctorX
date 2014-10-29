'use strict';

var redis = require('redis');
var sub = redis.createClient();
var feedStore = redis.createClient();

sub.select(9);
// redis db-[1] for status feed store
feedStore.select('1');

// var thunkify = require('thunkify');
var _ = require('underscore');
var co = require('co');

require('../content/schema');
require('../user/schema');
var groupFn = require('../group/fn');
var poiFn = require('../poi/fn');
var userFn = require('../user/fn');

sub.subscribe('status-channel');
sub.on('subscribe', function(channel, message) {
  console.log('[Status Offline Distributor] start to listening new statuses @', channel, '...', message);
});

sub.on('message', function(channel, message) {
  console.log(channel, message);
  
  try {
    var status = JSON.parse(message);  
    
    //share with members of some group(s)
    co(shareWithFriends)(status);

    //stream to content's feed stream
    co(shareToContentsAndSubers)(status);

  } catch (err) {
    console.error('status offline-distributor err', err);
  }

});

var shareWithFriends = function *(status) {
  try {
    var targets = yield getTargetList(status.sharedGroups, status.sharedUsers, status.owner);
    console.log('sending to targets', targets);
    
    var score = (new Date(status.created)).getTime();

    var multi = feedStore.multi();
    for (var i in targets) {
      multi.zadd('statuses:u:' + targets[i] + '-following', score, status._id);
    }
    multi.exec();
  } catch (err) {
    console.error('status share with friends err', err);
  }
}

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


var shareToContentsAndSubers = function *(status) {
  try {

    if (!isPublic(status.sharedGroups, status.sharedUsers)) {
      return ;
    }

    var score = (new Date(status.created)).getTime();
    var contents = status.contentIds;



    
    if (contents && contents.length) {
      console.log('sending to contents', contents);
      var multiContent = feedStore.multi();
      
      for (var i = 0; i < contents.length; i++) {
        multiContent.zadd('statuses:c:' + contents[i], score, status._id);
        multiContent.zadd('statuses:c:' + contents[i] + '-' + status.type, score, status._id);
      }
      multiContent.exec();

      var subers = yield poiFn.getSubers(contents);
      console.log('sending to subs', subers);
      
      var multiSuber = feedStore.multi();
      for (var i in subers) {
        multiSuber.zadd('statuses:u:' + subers[i] + '-subscribing', score, status._id);
      }
      multiSuber.exec();
    }
  } catch (err) {
    console.error('status share to contents err', err);
  }
}


var getTargetList = function *(groups, users, me){
  var members = [me];
  var followers = yield userFn.whoFollowMe(me);
  var followings = yield userFn.whoIfollow(me);

  if (!followers) {
    followers = [];
  }
  if (!users) {
    users = [];
  }
  if (!followings) {
    followings = [];
  }

  // reserved keywords priority: 'onlyme' > 'public' > 'friends'

  if ((groups && _.contains(groups, 'onlyme')) || (users && _.contains(users, 'onlyme')) ) {
    // only send to myself
    return [me];

  };

  if (groups && _.contains(groups, 'public')) {
    members = _.union(members, followers);
    // send to whoever follow me
    return members;

  } else if (groups && _.contains(groups, 'friends')) {
    members = _.intersection(followers, followings);
    members.push(me);

    // send to muture friends
    return members;

  } else if (groups && groups.length) {

    members = yield groupFn.getMembers(groups);
    members = _.union(members, users);
    members = _.intersection(members, followers);
    members.push(me);

    // send to group member and user
    return members;

  } else { // no groups set
    members = _.intersection(followers, followings, users);
    members.push(me);
    return members;
  }
}


