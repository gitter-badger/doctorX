/**
 * word function definition
 */
'use strict';

var redis = require('redis');
var store = redis.createClient(); // redis store for 'word' cache
// var pub = redis.createClient();
var thunkify = require('thunkify');
// var uuid = require('node-uuid');

var mongoose = require('mongoose');
var WordMongo = mongoose.model('Word');

var statusFn = require('../status/fn');

var write = function *(data, privacySetting) {
  console.log('word', data);
  if (!data.word || !data.word.trim().length) {
    throw new Error('empty word!');
  } else {
    data.word = data.word.trim();
  }

  var wordObj = new WordMongo(data);
  wordObj.save = thunkify(wordObj.save);

  yield wordObj.save();

  yield statusFn.createWordStatus(privacySetting, wordObj);

  return wordObj;
}

var wordFn = {
  'write': write
};

module.exports = wordFn;


// testCase
// var co = require('co');
// var generatorReturn = co(create)('this is status');

// co(statusFn.createReviewStatus)([]);
