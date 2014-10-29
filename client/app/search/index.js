'use strict';

var module = angular.module('search', []);

module.controller('searchCtrl', function($rootScope, $scope, $location, mySocket, searchService, poiService, optMessageService) {
  $scope.isLogin = $scope.$parent.isLogin;

  $scope.$watch('query', function(current, previous) {
    if (current === '') {
      $scope.searchResult = [];
    };
  });
  
  $scope.keyPress = function(evt) {
    if (evt.keyCode && evt.keyCode === 13) {// key 'enter' pressed
      search($scope.query, $scope, searchService);
    } else if (evt.keyCode && evt.keyCode === 27) {
      $scope.query = '';
    }
  }
  // $scope.goSearch = function(evt) {
  //   if (evt.keyCode && evt.keyCode === 27) {
  //     $scope.query = '';
  //   } else search($scope.query, $scope, searchService);
  // }
  
  $scope.showResult = $scope.searchResult && $scope.searchResult.length;

  $scope.$watch('searchResult', function(current, previous) {
    $scope.showResult = current && current.length != 0;
    if ($scope.query && $scope != '') {
      $scope.showAddItem = !$scope.showResult;
    } else {
      $scope.showAddItem = false;
    }
  });

  $scope.gotoDetailItem = function(evt, itemId) {
    console.log('detail for item id:', itemId);
    // go to detail page
    resetSearch($scope);
    $location.path('/content/home/' + itemId);
  }

  $scope.toAddContent = function() {
    resetSearch($scope);
    $location.path('/content/action/create');
  }

  $scope.fav = function(contentId, contentTitle) {
    // console.log(contentId, 'added to fav list');
    poiService.subscribe([contentId], function(data, status) {
      console.log('subscribe success', data, status);
      $rootScope.sysMsg = "[" + contentTitle + "] 收藏成功";
      optMessageService.successMsg();
    }, function(data, status) {
      console.log('subscribe fail', data, status);
      $rootScope.sysMsg = '收藏失败';
      optMessageService.failMsg();
    });
  };

  $scope.$on('app:locationChanged', function(data) {
    $scope.query = '';
  });

});

module.factory('searchService', function($http){
  return {
    search: function(q, success, failure) {
      $http.get('/search', { method:'GET' , params:{ 'q':q } }).success(success).error(failure);
    },
    searchByLimit: function(q, limit, success, failure) {
      $http.get('/search', { method:'GET', params:{ 'q':q, 'limit':limit}}).success(success).error(failure);
    }
  }
});

var resetSearch = function(scope) {
  scope.query = '';
  scope.searchResult = [];
}

var search = function(q, scope, searchService) {
  if (q == '') {
    scope.searchResult = [];
  } else {
    var onSuccess = function(data, status) {
      // console.log(status, data);
      if (status && status === 200) {
        scope.searchResult = data.result;
      }
    }
    var onFail = function(status, data) {
      console.error(status, data);
    }
    searchService.search(q, onSuccess, onFail);
  }
}
