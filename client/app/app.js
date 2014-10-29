// 'use strict';

var myApp = angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  // 'btford.socket-io',
  'sio',
  // 'ngTagsInput',
  'auth',
  'moduleA',
  'user',
  'frame',
  'home',
  'content',
  'search',
  'word',
  'feed',
  'dcbImgFallback',
  'underscore',
  'angularMoment',
  'infinite-scroll',
  'poi',
  'room',
  'chat',
  'setting',
  'circle'
]);

myApp.config(['$routeProvider', '$locationProvider', '$httpProvider', 
  function($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.responseInterceptors.push('httpInterceptor');

    $routeProvider.
      when('/login', {
        templateUrl: 'app/auth/login.html',
        // controller: 'auth.loginCtrl',

      }).
      when('/register', {
        templateUrl: 'app/auth/register.html'
      }).
      when('/home/:whichFeed', {
        templateUrl: 'app/home/home.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/action/create', {
        templateUrl: 'app/content/create.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/home/:contentId', {
        templateUrl: 'app/content/home.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/moduleA', {
        templateUrl: 'app/moduleA/view.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/live/:roomKey', {
        templateUrl: 'app/room/room.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/circle', {
        templateUrl: 'app/circle/relation.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/setting', {
        templateUrl: 'app/setting/setting.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/fav', {
        templateUrl: 'app/poi/fav.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      otherwise({
        redirectTo: '/home/following'
      });
    $locationProvider.html5Mode(false).hashPrefix('!');
  }
]);

myApp.factory('httpInterceptor', function httpInterceptor ($q, $location) {
  console.log('httpInterceptor init!');
  return function (promise) {
      var success = function (response) {
          return response;
      };

      var error = function (response) {
          if (response.status === 401) {
              $location.path('/login');
          }

          return $q.reject(response);
      };

      return promise.then(success, error);
  };
});



// myApp.constant('angularMomentConfig', {
//   preprocess: 'utc'
// });

myApp.run(function($rootScope, authService) {
  authService.attachTokenToHttp();
  // $rootScope.$on('app:login', function(evt, data) {
  //   console.log('got event with data', evt, data);
  //   $rootScope.$broadcast('app:login', data);
  // });
  $rootScope.$on('$locationChangeSuccess', function(evt, location) {
    console.log('$locationChangeSuccess fired!', evt, location);
    $rootScope.$broadcast('app:locationChanged', { 'location': evt });
  });

  $rootScope.$on('circle:memberGroupChanged', function(evt) {
    console.log('rootScope got', evt);
  });

  $rootScope.globalKeyUp = function(evt) {
    if (evt.keyCode && evt.keyCode === 191) {
      $('#globalSearchQ').focus();
    }
  }

});

var checkUserFn = function ($q, $location, userService) {
  var deferred = $q.defer(); 

  if (!userService.getUserLocal()) {
    console.log('reject');
    deferred.reject();
    $location.path('/login');
  } else {
    console.log('resolve');
    deferred.resolve();
  }
  return deferred.promise;
}



