'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  via: {
    type: String,
    default: 'web'
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  provider: {
    type: String,
    default: 'local'
  },
  encryptPass: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    default: 'unknown'
  },
  contact: String,
  avatarUrl: String,
  weibo: {
    id: String,
    avatar: String,
    tokenSecret: String,
    token: String
  },
  douban: {
    id: String,
    avatar: String,
    tokenSecret: String,
    token: String
  },
  twitter: {
    id: String,
    avatar: String,
    tokenSecret: String,
    token: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 1
  }
});

UserSchema.path('email').validate(function(email) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    if (this.provider != 'local') return true;
    return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

UserSchema.virtual('password')
.set(function(password) {
  this._password = password;
  this.encryptPass = this.encryptPassword(password);
})
.get(function() {
  return this._password
});

UserSchema.pre('save', function(next) {
  console.log('pre save', this);
  next();
});

UserSchema.methods = {
  encryptPassword: function(password) {
    return password + '-encrypt';
  },
  allowLogin: function(password) {
    if (this.encryptPassword(password) === this.encryptPass) {
      return true;
    }
    return false;
  }
}

var User = mongoose.model('User', UserSchema);

var thunkify = require('thunkify');
User.findOne = thunkify(User.findOne);
// User.findById = thunkify(User.findById);