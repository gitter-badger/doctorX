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



