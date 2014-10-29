'use strict';
var redis = require('redis');
var store = redis.createClient();

var thunkify = require('thunkify');

var mongoose = require('mongoose');
var User = mongoose.model('User');



var fn = {
  login: function *(data) {
    var user = yield User.findOne({ 'email':data.email, 'provider':'local' });
    if (user && user.allowLogin(data.password)) {
      return user.id;
    } else {
      throw new Error('wrong username or password');
    }
  },
  register: function *(data) {
    var user = new User(data);
    user.save = thunkify(user.save);
    yield user.save();
    return user;
  }
};


module.exports = fn;