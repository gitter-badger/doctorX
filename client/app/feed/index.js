'use strict';

var module = angular.module('feed', []);

module.controller('feedCtrl', function($scope, $timeout, feedService) {



  $scope.init = function(whichFeedStream) {
    $scope.whichFeed = whichFeedStream;
  }
  // console.log('feedCtrl init@', $scope.whichFeed);
  $scope.busy = false;
  $scope.isLoading = false;
  $scope.lastStatusId = '';
  $scope.feed_Following = [];
  var onSuccess = function(data, status) {
    if (data.status === 200) {
      if (data.result && data.result.length > 0) {
        for (var i = 0; i < data.result.length; i++) {
          $scope.feed_Following.push(data.result[i]);
        };
        // var index = data.result.length - 1;
        $scope.lastStatusId = data.result[data.result.length - 1]._id;
        // console.log('the current lastStatusId', $scope.lastStatusId);
        $scope.busy = false;
        $scope.isLoading = false;

        $timeout(function() {
          $('.feedCard .content .name').popup({
            on : 'hover',
            inline : true,
            duration : 150
          });
        }, 10);
        
      } else {
        // the end
        $scope.busy = true;
        $scope.isLoading = false;
      }
    }
  };

  var onFail = function(data, status) {
    $scope.busy = true;
    $scope.isLoading = false;
    console.log(data, status);
  };

  $scope.nextPage = function() {
    // console.log($scope.whichFeed, 'exec nextPage()!');
    if ($scope.whichFeed && $scope.whichFeed.length) {
      $scope.busy = true;
      $scope.isLoading = true;
      feedService.following($scope.whichFeed, $scope.lastStatusId, 10, onSuccess, onFail);
    } else {
      $scope.busy = true;
      $scope.isLoading = false;
    }
    
  };
  $scope.feedWidth = "twelve wide column";

  $scope.clickCard = function() {
    if ( $scope.feedWidth == "eight wide column" ) {
      $scope.feedWidth = "twelve wide column";
    } else if ($scope.feedWidth == "twelve wide column") {
      $scope.feedWidth = "eight wide column";
    }
    
  }

  
});

module.factory('feedService', function($http, userService) {
  return {
    following: function(which, last, count, success, failure) {
      // console.log('feedService to get', which, '...');
      $http.get('/feed/' + which, { method:'GET', params: { 'lastStatusId':last, 'pageCount':count } }).success(success).error(failure);
    }
  }
});