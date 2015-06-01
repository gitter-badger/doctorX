/**
 * status function definition
 * status type(origin): word, review, content contribution, reshare, comment, like, upvote, downvote,  
 */
'use strict';

var redis = require('redis');
var statusIndex = redis.createClient();
var statusStore = redis.createClient();
var pub = redis.createClient();
var thunkify = require('thunkify');
var uuid = require('node-uuid');
// var _ = require('underscore');

pub.select(9);
statusIndex.select(1);
statusIndex.zrange = thunkify(statusIndex.zrange);
statusIndex.zrevrangebyscore = thunkify(statusIndex.zrevrangebyscore);
statusIndex.zrevrank = thunkify(statusIndex.zrevrank);

statusStore.hgetall = thunkify(statusStore.hgetall);

var mongoose = require('mongoose');
var StatusMongo = mongoose.model('Status');

var create = function *(status) {
  console.log('status', status);
  if (!status.type || status.type == '') {
    throw new Error('missing status.type');
  }

  if ((!status.sharedUsers || !status.sharedUsers.length) && (!status.sharedGroups || !status.sharedGroups.length)) {
    //default to public if no privacy setting set
    status.sharedGroups = ['public'];
  }

  if (status.allowComment == undefined || status.allowComment == null) {
    status.allowComment = true;
  }

  if (status.allowReshare == undefined || status.allowReshare == null) {
    status.allowReshare = true;
  }

  var statusObj = new StatusMongo(status);
  statusObj.save = thunkify(statusObj.save);

  yield statusObj.save();

  // catch exception in case [Redis publish] fails, 
  // make sure the main process of status still be able to continue
  try {
    pub.publish('status-channel', JSON.stringify(statusObj));
  } catch (err) {
    console.error('status publish to Redis Channel fail', err, statusObj);
  }

  return statusObj;
}

var statusFn = {
  
  'createStatus': create,
  'createReviewStatus': function *(status) {
    status.type = 'review';
    return yield create(status);
  },
  'createWordStatus': function *(privacySetting, word) {
    var status = {
      'type': 'word',
      'via': word.via,
      'owner': word.author,
      'contentIds': word.contentIds,
      'summary': word.word,
      'hashtags': word.hashtags,
      'originalLink': word._id,
      'sharedGroups': privacySetting.sharedGroups,
      'sharedUsers': privacySetting.sharedUsers,
      'allowComment': privacySetting.allowComment,
      'allowReshare': privacySetting.allowReshare
    }
    return yield create(status);
  },
  'createCCStatus': function *(privacySetting, content) { // CC = Content Contribution
    var status = {
      'type': 'contribute',
      'via': content.via,
      'owner': content.by,
      'contentIds': [content._id],
      'summary': 'Created a new Content <' + content.displayTitle + '>',
      'sharedGroups': privacySetting.sharedGroups,
      'sharedUsers': privacySetting.sharedUsers,
      'allowComment': privacySetting.allowComment,
      'allowReshare': privacySetting.allowReshare
    }
    return yield create(status);
  },
  'getStatusStream': function *(viewer, stream, max, min, offset, count) {
    if (!stream || !stream.length) {
      return [];
    }
    switch (stream) {
      case '': 
        break;
      case '':
        break;
      case '':
        break;
      default:

    }
  },
  'getMyFollowingStream': function *(me, lastStatusId, pageCount) {
    if (!me || !me.length) {
      console.log('missing user');
      return [];
    }
    var streamKey = 'statuses:u:' + me + '-following';
    var result = yield retrieveStreamByKey(streamKey, lastStatusId, pageCount);
    return result;
  },
  'getMySubscribeStream': function *(me, lastStatusId, pageCount) {
    if (!me || !me.length) {
      return [];
    }
    var streamKey = 'statuses:u:' + me + '-subscribing';
    var result = yield retrieveStreamByKey(streamKey, lastStatusId, pageCount);
    return result;
  },
  'getMySubscribeStreamAdv': function *(me, lastStatusId, pageCount) {
    var entries = yield this.getMySubscribeStream(me, lastStatusId, pageCount);
    return yield fillEntries(entries);
  },
  'getStreamByContent': function *(contentId, type, lastStatusId, pageCount) {
    if (!contentId || !contentId.length) {
      return [];
    }
    if (!type || !type.length || type === 'all') {
      type = '';
    } else {
      type = '-' + type;
    }
    var streamKey = 'statuses:c:' + contentId + type;
    var result = yield retrieveStreamByKey(streamKey, lastStatusId, pageCount);
    return result;
  },
  'getMyFollowingStreamByContent': function *(me, contentId, lastStatusId, pageCount) {

    // -------------------------------------------------------------------------------------------------------TBD
    return [];
  },
  'getMyFollowingStreamAdv': function *(me, lastStatusId, pageCount) {
    var entries = yield this.getMyFollowingStream(me, lastStatusId, pageCount);
    return yield fillEntries(entries);
  }
};

module.exports = statusFn;

var getCachedStatus = function *(statusId) {
  if (statusId && statusId.length) {
    var status = yield statusStore.hgetall('status:id:' + statusId);
    // console.log('get all status hashes from redis cache:\n', status);
    return status;
  }
  return null;
}

var retrieveStreamByKey = function *(streamKey, lastStatusId, pageCount) {
  // console.log('lastStatusId:', lastStatusId);
  var offset;
  if (!lastStatusId || !lastStatusId.length) {
    offset = 0; //default retrieve from the top/head
  } else {
    offset = yield statusIndex.zrevrank(streamKey, lastStatusId);
    if (offset === 0) {
      // means last is also the first at the same time
      return null;
    } else if (!offset) {
      console.log('lastStatusId does not exist');
      offset = 0; //the lastStatusId does not exist, so retrieve from the head
    } else {
      offset++;
    }
  }

  if (!pageCount || pageCount === 0) {
    pageCount = 10; //default return 10 statuses per page
  }

  var result = yield statusIndex.zrevrangebyscore(streamKey, '+inf', '-inf', 'limit', offset, pageCount);
  return result;
}

var fillEntries = function *(entries) {
  if (entries) {
    for (var i = 0; i < entries.length; i++) {
      var status = yield getCachedStatus(entries[i]);
      if (status) {
        entries[i] = status;
      } else {
        var id = entries[i];
        entries[i] = yield StatusMongo.findOne( { _id:id } );
        if (entries[i]) {
          entries[i] = yield StatusMongo.populate(entries[i], 'owner contentIds');
        } else {
          entries[i] = {
            '_id': id,
            'summary': '这条更新神秘的消失了……',
            'type': 'missing'
          }
        }
      }
    } 
  }
  return entries;
  
}

// var fillEntries = function *(entries) {
//   var result = yield StatusMongo.find({
//     '_id': { $in: entries }
//   }).exec();
//   return result;
// };