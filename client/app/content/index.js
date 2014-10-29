'use strict';

var module = angular.module('content', []);

module.controller('contentCreateCtrl', function($scope, contentFactory) {
  // $('.ui.checkbox').checkbox();
  
  $scope.title = '添加内容';
  $scope.shouldFocus = true;
  resetContent($scope);

  $('.ui.dropdown#contentType').dropdown('setting', 'onChange', function(value, text) {
    $scope.content.type = value;
  })

  var postContent = function() {
    console.log('.ui.dropdown get value', $('.ui.dropdown#contentType').dropdown('get value'));

    if (!$scope.content.type) {
      $scope.content.type = 'unknown';
      // return;
    }

    var onSuccess = function(data, status) {
      console.log(data, status);
      resetContent($scope);
    };
    var onFailure = function(data, status) {
      console.log(data, status);
    };

    contentFactory.create($scope.content, onSuccess, onFailure);
  }

  $('#contentCreationForm.ui.form').form(
    {
      displayTitle: {
        identifier: 'display-title',
        rules: [{
          type: 'empty',
          prompt: 'Please enter a display title'
        }]
      }
    },
    {
      onSuccess:postContent
    }
  );


});

module.controller('contentHomeCtrl', function($scope, $routeParams, $location, contentFactory) {
  contentFactory.setCurrentContent($routeParams.contentId);

  var initView = function() {
    $('.ui.rating').rating();
    $('#contentcover').dimmer({on:'hover'});
  }

  $scope.toggleList = function() {
    $('#subContentList').sidebar('toggle');
  }

  $scope.joinRoom = function(room) {
    if (!room || !room.length) {
      room = contentFactory.getCurrentContent();
    }
    $location.path('/content/live/' + room);
  }

  contentFactory.loadContentProfile($routeParams.contentId, function(data, status) {
    $scope.contentProfile = data.reply;
    contentFactory.setCurrentContentProfile(data.reply);
  }, function(data, status) {
    console.error('data, status', data, status);
  });
  
  initView();

});



module.factory('contentFactory', function($http, userService){
  var _contentid;
  var _contentProfile;
  return {
    create: function(data, success, failure) {
      data.by = userService.getUserLocal();
      $http.post('/content/create', data, {method:'POST'}).success(success).error(failure);
    },
    setCurrentContent: function(contentId) {
      _contentid = contentId;
      // console.log('set current contentid', _contentid);
    },
    getCurrentContent: function() {
      return _contentid;
    },
    setCurrentContentProfile: function (contentProfile) {
      _contentProfile = contentProfile;
    },
    getCurrentContentProfile: function () {
      return _contentProfile;
    },
    loadContentProfile: function(contentId, success, failure) {
      if (contentId || contentId.length) {
        $http.get('/content/profile/' + contentId, { 'method':'GET' }).success(success).error(failure);
      }
    }
  }
});


var resetContent = function(scope) {
  scope.content = {};
  $('#contentType.ui.dropdown').dropdown('set value', 'unknown');
  $('#contentType.ui.dropdown').dropdown('set text', 'Choose');
}

