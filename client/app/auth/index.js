'use strict';

var module = angular.module('auth', ['ngCookies']);

module
.controller('auth.loginCtrl', ['$rootScope', '$scope', '$window', '$location', 'authService', 'userService',
  function($rootScope, $scope, $window, $location, authService, userService) {
    var onSuccess = function(data, status) {
      console.log('Success with data', data);
      if (data.status === 200) {
        userService.storeUserLocal(data.userid);
        authService.attachTokenToHttp();
        $location.path('/');
        
        $rootScope.$broadcast('app:login', { 'userid': data.userid });
      
      } else if (data.status === 500) {
        userService.clearUserLocal();
        authService.clearTokenFromHttp();
      }
      
    };
    var onFailure = function(data, status, headers, config) {
      if (status === 0) {
        console.error('request timeout');
      };
    }

    $scope.login = function() {
      authService.login($scope.email, $scope.password, onSuccess, onFailure);
    };

    $scope.twitterLogin = function() {
      console.log('login via twitter');
      var width = 640;
      var height = 450;
      var x = screen.width/2 - width/2;
      var y = screen.height/2 - height/2;

      $window.open('/auth/twitter','Authentication',
        'location=1,toolbar=1,menubar=1,resizable=1,width='+width+',height='+height+',left='+x+',top='+y);
    };

    $scope.doubanLogin = function() {
      console.log('login via douban');
      var width = 640;
      var height = 450;
      var x = screen.width/2 - width/2;
      var y = screen.height/2 - height/2;

      $window.open('/auth/douban','Authentication',
        'location=1,toolbar=1,menubar=1,resizable=1,width='+width+',height='+height+',left='+x+',top='+y);
    };
  }
]);

module
.controller('auth.registerCtrl', ['$scope', 'authService',
  function($scope, authService) {
    var onSuccess = function(data, status) {
      console.log('Success with data', data);
      if (data.status === 200) {
        // $('#register').modal('hide');
      } else if (data.status === 500) {
        switch (data.err.code) {
          case 11000:
            alert('exist!');
            break;
          default: break;
        }
      };
    };
    var onFailure = function(data, status, headers, config) {
      console.log(data, status);
      if (status === 0) {
        console.log('request timeout');
      };
    };
    $scope.register = function() {
      console.log($scope.email, $scope.username, $scope.password, $scope.gender);
      authService.register($scope.email, $scope.username, $scope.password, $scope.gender, onSuccess, onFailure);
    };
    
    $scope.pop = function() {
      $('#register').modal('show');
    };

    $scope.dropdown = function() {
      $('#genderDD.ui.dropdown').dropdown('toggle');
    }
  }
]);

module.factory('authService', function($http, userService){
  return {
    login: function(email, password, success, failure) {
      var user = { email:email, password:password };
      $http.post('/login', user, {method:'POST'}).success(success).error(failure);
    },
    register: function(email, username, password, gender, success, failure) {
      var user = { email:email, username:username, password:password, gender:gender };
      $http.post('/register', user, {method:'POST'}).success(success).error(failure);

    },
    authToken: function() {

    },
    attachTokenToHttp: function() {
      $http.defaults.headers.common['X-Access-Token'] = userService.getUserLocal();
    },
    clearTokenFromHttp: function() {
      $http.defaults.headers.common['X-Access-Token'] = null;
    }
  }
});