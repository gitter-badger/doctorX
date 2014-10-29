'use strict';

var contentFn = require('./fn');


exports.create = function *(next) {
  var content = this.req.body;
  
  try {
    var contentId = yield contentFn.create(content);
    this.body = { 'status': 200, 'contentId': contentId };
  } catch (err) {
    console.error('content middleware create err', err);
    this.body = { 'status': 500, 'err': err.message };
  }

}

exports.getProfile = function *(next) {
  try {
    var contentProfile = yield contentFn.getProfile(this.params.contentId);
    this.body = { 'status':200, 'reply':contentProfile };
  } catch (err) {
    console.error('content middleware getProfile err', err);
    this.body = { 'status':500, 'err':err.message };
  }
}

exports.list = function *(next){

}

