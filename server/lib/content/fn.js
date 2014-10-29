'use strict';

var redis = require('redis');
// var store = redis.createClient();
var pub = redis.createClient();
var thunkify = require('thunkify');
// var uuid = require('node-uuid');
var statusFn = require('../status/fn');

var mongoose = require('mongoose');
var ContentMongo = mongoose.model('Content');

var fn = {
  'create': function *(data) {
    var content = new ContentMongo(data);
    content.save = thunkify(content.save);

    try {
      yield content.save();
      console.log(content);
      pub.publish('content-channel', JSON.stringify(content));

      var status = {
        'type': 'contribute',
        'via': content.via,
        'owner': content.by,
        'contentIds': [content._id],
        'summary': 'Created a new Content <' + content.displayTitle + '>',
        'sharedGroups': ['public']
      };
      yield statusFn.createCCStatus({}, content); // to be set: privacySetting
      // yield statusFn.createStatus(status);
      
      return content.id;
    } catch (err) {
      console.error('content fn create err', err);
      throw err;
    }
  },
  'getProfile': function *(contentId) {
    if (!contentId || !contentId.length) {
      throw new Error('missing contentId');
    }
    try {
      return yield ContentMongo.findOne({ _id:contentId });
    } catch(err) {
      console.error('content fn getProfile err', err);
      return null
    }
  }
}


module.exports = fn;