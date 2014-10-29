'use strict';

var module = angular.module('home', []);
module.controller('homeCtrl', function($scope, feedService, $timeout, $routeParams) {
  // console.log('home controller');
  // $scope.busy = false;
  // $scope.isLoading = false;
  // $scope.lastStatusId = '';
  // $scope.feed_Following = [];

  if ($routeParams.whichFeed && $routeParams.whichFeed.length) {
    $scope.which = $routeParams.whichFeed;
  } else {
    $scope.which = 'following';
  }
  console.log('homeCtrl which:', $scope.which);
  
  $scope.$on('app:login', function(evt, data) {
    console.log('home got event', evt, data);
  });

  $scope.popImage = function(src) {
    $scope.imgToPop = src;
    $('#imageModal.modal').modal('show'); 

  };

  // var onSuccess = function(data, status) {
  //   // console.log(data, status);
  //   if (data.status === 200) {
  //     if (data.result && data.result.length) {
  //       for (var i = 0; i < data.result.length; i++) {
  //         $scope.feed_Following.push(data.result[i]);
  //       };
  //       var index = data.result.length - 1;
  //       $scope.lastStatusId = data.result[index]._id;
  //       // console.log('the current lastStatusId', $scope.lastStatusId);
  //       $scope.busy = false;
  //       $scope.isLoading = false;
  //     } else {
  //       // the end
  //       $scope.busy = true;
  //       $scope.isLoading = false;
  //     }
  //   }
  // };

  // var onFail = function(data, status) {
  //   $scope.busy = false;
  //   $scope.isLoading = false;
  //   console.log(data, status);
  // };

  // $scope.nextPage = function() {
  //   $scope.busy = true;
  //   $scope.isLoading = true;
  //   feedService.following($scope.lastStatusId, 10, onSuccess, onFail);
  // };

  // $('#example').dimmer('show');

  // $('#demoimg').dimmer({on: 'hover'});
  // $timeout(function() {
  //   $('.comment .avatar').popup({
  //     on: 'click'
  //   });
  // }, 5000);

});

module.directive("mySrc", function() {
  return {
    link: function(scope, element, attrs) {
      var img, loadImage;
      img = null;

      loadImage = function() {

        element[0].src = "pathToSpinner";

        img = new Image();
        img.src = attrs.mySrc;

        img.onload = function() {
          element[0].src = attrs.mySrc;
        };
      };

      scope.$watch((function() {
        return attrs.mySrc;
      }), function(newVal, oldVal) {
        if (oldVal !== newVal) {
          loadImage();
        }
      });
    }
  };
});

