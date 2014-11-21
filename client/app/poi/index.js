'use strict';

var module = angular.module('poi', []);

module.controller('poiShowCtrl', function($scope, poiService) {
  $scope.pois = [];
  poiService.getPOIs(function(data, status) {
    
    if (status === 200) {
      $scope.pois = data.result
    } else {
      console.log(data, status);
    }
  }, function(data, status) {
    console.log(data, status);
  });
});

// module.factory('poiService', function($http, userService) {
module.factory('poiService', function($http) {
  return {
    subscribe: function(contentIds, success, failure) {
      var postData = { 'contentIds': contentIds };
      $http.post('/poi/subscribe', postData, {method:'POST'}).success(success).error(failure);
    },
    unsubscribe: function(contentIds, success, failure) {
      var postData = { 'contentIds': contentIds };
      $http.post('/poi/unsubscribe', postData, {method:'POST'}).success(success).error(failure);
    },
    getPOIs: function(success, failure) {
      $http.get('/poi/subscribed', { method:'GET' }).success(success).error(failure);
    }
  }
});