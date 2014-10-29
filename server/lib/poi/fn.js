/**
 * TBD
 * -- 'subscribe'
 *    import recent(let's say 1 month) statuses about the subscribed contents to the suber's '-subscribing' feed stream set
 */

'use strict';

var redis = require('redis');
var store = redis.createClient();

var thunkify = require('thunkify');
// var uuid = require('node-uuid');
var _ = require('underscore');

store.sunion = thunkify(store.sunion);
store.smembers = thunkify(store.smembers);
store.sadd = thunkify(store.sadd);
store.hgetall = thunkify(store.hgetall);
store.srem = thunkify(store.srem);

var mongoose = require('mongoose');

var ContentMongo = mongoose.model('Content');

var poiFn = {
  'getSubers': function * (contentIds) {
    if (contentIds && contentIds.length) {
      console.log('contentIds', contentIds);
      for (var i in contentIds) {
        contentIds[i] = 'subers:c:' + contentIds[i];
      }
      var subers = yield store.sunion(contentIds);
      return subers;
    }
    return [];
  },
  'subscribe': function * (userId, contentIds) {
    if (contentIds && contentIds.length) {
      var count = yield store.sadd('pois:u:' + userId, contentIds);
      for (var i in contentIds) {
        yield store.sadd('subers:c:' + contentIds[i], userId);
      }
      return count;
    }
    return 0;
  },
  'unsubscribe': function * (userId, contentIds) {
    if (contentIds && contentIds.length) {
      var count = yield store.srem('pois:u:' + userId, contentIds);
      for (var i in contentIds) {
        yield store.srem('subers:c:' + contentIds[i], userId);
      }
      return count;
    }
    return 0;
  },
  'getPOIs': function * (userId) {
    return yield store.smembers('pois:u:' + userId);
  },
  'getPOIsAdv': function * (userId) {
    var entries = yield this.getPOIs(userId);
    return yield fillEntries(entries);
  }
}

module.exports = poiFn;

var getCachedContent = function *(contentId) {

  if (contentId && contentId.length) {
    var content = yield store.hgetall('content:id:' + contentId);
    return content;
  }
  return null;
};

// var fillEntries = function *(entries) {
//   for (var i = 0; i < entries.length; i++) {
//     var content = yield getCachedContent(entries[i]);
//     if (content) {
//       entries[i] = content;
//     } else {
//       var id = entries[i];
//       entries[i] = yield ContentMongo.findOne( { _id:id } );
//       if (!entries[i]) {
//         entries[i] = {
//           '_id': id,
//           'displayTitle': '这个内容神秘的消失了',
//           'type': 'missing'
//         }
//       }
//     }
//   }
//   return entries;
// };

var fillEntries = function *(entries) {
  var result = yield ContentMongo.find({
    '_id': { $in: entries}
  }).exec();
  return result;
};
