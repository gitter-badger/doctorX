'use strict';
// var mongoose = require('mongoose');
// var User = mongoose.model('User');
// var thunkify = require('thunkify');
// User.findOne = thunkify(User.findOne);
var crypto = require('crypto');

var loginFn = require('./fn');
var friendFn = require('../friend/fn');

var login = function *(next) {
  try {
    var data = this.req.body;
    var userid = yield loginFn.login(data);
    this.body = { status:200, msg:'login ok!', userid:userid };
  } catch(err) {
    console.error('err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var register = function *(next) {
  console.log('req.body', data);
  var data = this.req.body;
  try {
    var user = yield loginFn.register(data);
    this.body =  { status:200, msg:'register ok!', userid:user.id };
  } catch (err) {
    console.error('err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var registerWithInvitation = function *(next) {
  var data = this.req.body;
  if (!data.ivcode || !data.ivcode.length) {
    this.status = 500;
    this.body = { status:500, err:'missing ivcode' };
    return;
  }

  try {
    var user = yield loginFn.register(data);
    var redeemReply = yield friendFn.redeemIVcode(data.ivcode, user.id);
    this.body = { status:200, msg:'register ok!', userid:user.id, redeem:redeemReply };

    // TBD: give bonus to both users

  } catch (err) {
    console.error('err', err);
    if (err.message == 'ivcode already used') {
      this.status = 200;
      this.body = { status:500, msg:'register ok!', userid:user.id, redeem:err.message };
    } else {
      this.status = 500;
      this.body = { status:500, err:err.message };  
    }
  }
}

exports.login = login;
exports.register = register;
exports.registerWithInvitation = registerWithInvitation;