'use strict';

var wordFn = require('./fn');

exports.write = function *(next) {
  var word = this.req.body.word;
  var privacy = this.req.body.privacy;
  
  try {
    var reply = yield wordFn.write(word, privacy);
    this.body = { 'status': 200, 'word': reply };
  } catch (err) {
    console.error('word middleware fn:write err', err);
    this.body = { 'status': 500, 'err': err.message };
  }

}