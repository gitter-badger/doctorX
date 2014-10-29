'use strict';

var redis = require('redis');
var store = redis.createClient();

var thunkify = require('thunkify');
// var uuid = require('node-uuid');

store.smembers = thunkify(store.smembers);

var mongoose = require('mongoose');
var UserMongo = mongoose.model('User');

var userFn = {
  'getUserProfile': function *(userId) {
    if (userId) {
      return yield UserMongo.findOne({ _id: userId }, 'username email gender level provider avatarUrl');
    }
    return null;
  },
  'whoFollowMe': function *(me) {
    if (me) {
      return yield store.smembers('followers:u:' + me);
    }
    return null;
  },
  'whoIfollow': function *(me) {
    if (me) {
      return yield store.smembers('following:u:' + me);
    }
  },
  'populateUsers': function *(entries) {
    for (var i = 0; i < entries.length; i++) {
      var userid = entries[i];
      entries[i] = yield UserMongo.findOne({ _id: userid }, 'username gender level provider avatarUrl');
      if (!entries[i]) {
        entries[i] = { _id:userid, username:null };
      }
    };
    return entries;
  }
}

module.exports = userFn;