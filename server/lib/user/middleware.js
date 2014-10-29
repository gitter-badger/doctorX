'use strict';
var mongoose = require('mongoose');
// var User = mongoose.model('User');
var userFn = require('./fn');

var getUser = function * (next) {
  // console.log('userid', this.query.userid);
  // console.log('from req userid', this.req.me);

  var userid = this.query.userid;
  try {
    var user = yield userFn.getUserProfile(userid);
    this.body = { 'status': 200, 'user': user };
    // console.log('after getUser');
  } catch (err) {
    console.error(err);
    this.body = { 'status': 500, 'err': err.message };
  }
}

exports.getUser = getUser;