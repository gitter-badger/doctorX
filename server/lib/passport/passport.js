// 'use strict';

var passport = require('koa-passport');
var appConfig = require('../../config/appConfig');

var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.serializeUser(function(user, done) {
  console.log('serializeUser with id:', user.id);
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser id:', id);
  var user = {};
  user.id = id;
  done(null, user);
})

// callback function [done] def
// dont(err, user, info)
// var LocalStrategy = require('passport-local').Strategy
// passport.use(new LocalStrategy(function(username, password, done) {
//   // retrieve user ...
//   if (username === 'test' && password === 'test') {
//     var user = new Object();
//     user.id = 'testid';
//     user.provider = 'local';
//     done(null, user);
//   } else {
//     done(null, false, { message:'wrong' });
//   }

//   userService.isUser();


// }))

var WeiboStrategy = require('passport-weibo').Strategy
passport.use(new WeiboStrategy({
    clientID: 'your-client-id',
    clientSecret: 'your-secret',
    // callbackURL: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT) + '/auth/weibo/callback'
    callbackURL: 'http://localhost/auth/weibo/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))

var FacebookStrategy = require('passport-facebook').Strategy
passport.use(new FacebookStrategy({
    clientID: 'your-client-id',
    clientSecret: 'your-secret',
    // callbackURL: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT) + '/auth/facebook/callback'
    callbackURL: 'http://localhost/auth/facebook/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))

var DoubanStrategy = require('passport-douban').Strategy
passport.use(new DoubanStrategy({
    clientID: '03a8a9b72f6d3a290af9fd258e47ae7b',
    clientSecret: 'e9a649ffe93b4831',
    // callbackURL: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT) + '/auth/douban/callback'
    callbackURL: 'http://localhost/auth/douban/callback'
  },
  function(token, tokenSecret, profile, done) {
    console.log('token', token);
    console.log('tokenSecret', tokenSecret);
    console.log('profile', profile);

    User.findOne({ 'provider':'douban', 'douban.id':profile.id })(function(err, exist) {
      if (exist) {
        //just login the loaded user
        done(null, exist);
      }else {
        //register as new user
        registerViaOauth('douban', token, tokenSecret, profile.id, profile.displayName, profile.avatar, done);
      }
    });
  }
));

var TwitterStrategy = require('passport-twitter').Strategy
passport.use(new TwitterStrategy({
    consumerKey: 'MGfDmD3FG9tsNKUv2FMtDb2vy',
    consumerSecret: 'tb7LdJgyBz55X8tdY6xZGgwCQ50iYEAYq4nflRwtSeGNlexZea',
    // callbackURL: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT) + '/auth/twitter/callback'
    callbackURL: 'http://localhost/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    // console.log('token:', token);
    // console.log('tokenSecret:', tokenSecret);
    // console.log('twitter profile', profile);

    User.findOne({ 'provider':'twitter', 'twitter.id': profile.id })(function(err, exist) {
      if (exist) {
        done(null, exist);
      } else {
        //register as new user
        registerViaOauth('twitter', token, tokenSecret, profile.id, profile.username, profile._json.profile_image_url, done);
      }    
    });
  }
))

var GoogleStrategy = require('passport-google').Strategy
passport.use(new GoogleStrategy({
    // returnURL: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT) + '/auth/google/callback',
    returnURL: 'http://localhost/auth/google/callback',
    // realm: 'http://localhost:' + (process.env.PORT || appConfig.DEFAULT_PORT)
    realm: 'http://localhost'
  },
   function(identifier, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))

var registerViaOauth = function(provider, token, tokenSecret, id, username, avatar, done) {
  var user = new User();
  user.email = user.id + '@doctorX.com';
  user.username = username;
  user.provider = provider;
  user[provider] = {
    'id': id,
    'avatar': avatar,
    'token': token,
    'tokenSecret': tokenSecret
  };
  user.save(function(err, data) {
    if (!err) {
      done(null, user);
    } else {
      done(err, null);
    }
  });
}

