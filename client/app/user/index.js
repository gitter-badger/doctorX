'use strict';

var module = angular.module('user', []);

module.factory('userService', function($window, $http) {
  var _token = null;

  return {
    'getUserLocal': function() {
      if (!_token) {
        // console.log('load user ag!');
        _token = $window.localStorage.tumkr;
        // console.log('_token', _token);
      }
      return _token;
    },
    'getUserRemote': function(success, failure) {

      if (_token) {
        // if (_user) {
        //   success({'status':200, 'user':_user});
        // } else {
        //   console.log('get user remotely', _token);
        //   var _success = function(data, status) {
        //     _user = data.user;
        //     success(data, status);
        //   };
        //   $http.get('/user', { method:'GET' , params:{ 'userid':_token } }).success(_success).error(failure);
        // }
        $http.get('/user', { method:'GET' , params:{ 'userid':_token } }).success(success).error(failure);
      } else {
        failure(401, null);
      }
    },
    'getOtherUserRemote': function(userid, success, failure) {
      if (userid) {
        $http.get('/user', { method:'GET' , params:{ 'userid':userid } }).success(success).error(failure);
      }
    },
    'storeUserLocal': function(userid) {
      _token = userid;
      $window.localStorage.tumkr = userid;
    },
    'clearUserLocal': function() {
      _token = null;
      $window.localStorage.removeItem('tumkr');
    }
  }
});