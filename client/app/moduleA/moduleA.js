'use strict';

var moduleA = angular.module('moduleA', ['ngCookies']);
moduleA.controller('moduleA.someCtrl', ['moduleAsomeFactory','$scope', '$cookieStore', '$cookies', '$location', 'mySocket',
  function(moduleAsomeFactory, $scope, $cookieStore, $cookies, $location, socket) {
    $scope.title = 'module A';
    // $location.path('/login');

    // $scope.cookiesContent = $cookieStore.get('angular-accessToken');
    // $scope.passportCookies = document.cookie;
    // socket.removeAllListeners('news');
    // socket.on('news', function (data) {
    //   console.log(data);
    //   // socket.emit('my-other-event', { my: 'data' });
    //   if ($scope.feed) {
    //     $scope.feed = $scope.feed +'\n'+ data;
    //   } else {
    //     $scope.feed = data;
    //   }
    // });

    $scope.$on('socket:personal', function (evt, data) {
      console.log(data);
      // socket.emit('my-other-event', { my: 'data' });
      // if ($scope.feed) {
      //   $scope.feed = $scope.feed + '--' + data;
      // } else {
      //   $scope.feed = data;
      // }
      if (!$scope.feeds) {
        $scope.feeds = [];
      }
      $scope.feeds.unshift(data);

    });

    var onSuccess = function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.echo = data.echo;

    }
    var onFailure = function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
    }

    // moduleAsomeFactory.doA(onSuccess, onFailure);
  }]);

moduleA.factory('moduleAsomeFactory', function($http) {
  return {
    doA: function (success, failure) {
      // $http(
      //   {
      //     method: 'POST',
      //     url: '/test'
      // })
      // .success(success).error(failure);
    }
  };
});