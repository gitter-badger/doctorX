'use strict';

var module = angular.module('word', []);

module.controller('wordPostCtrl', function($scope, $http, contentFactory, searchService, _, $timeout, wordFactory, circleService) {
  var loadAllGroups = function() {
    circleService.groups(function(data, status) {
      $scope.groups = data.result;
      $timeout(function() {
        // $('#shareTo').dropdown();
        $('#shareTo').dropdown('set text', 'public');
      }, 20);
      
    }, function(data, status) {
      console.error(data, status);
    });
  }

  $('#wordPostModal').modal('setting', {
    'onShow': function() {
      // console.log('#wordPostModal onShow fired!');
      loadAllGroups();
    }
  });

  $scope.referredContents = [];
  var currentContent = contentFactory.getCurrentContent();
  if (currentContent) {
    $scope.referredContents.push(currentContent);
  }
  $scope.showleft = ($scope.referredContents && $scope.referredContents.length);

  //reset privacy
  var resetPrivacy = function() {
    $scope.showFriendSearch = false;
    $scope.selectedGroups = [];
    $scope.selectedUsers = [];
    $scope.selectedGroup = 'public';
    $scope.selectedUser = '';
  }

  resetPrivacy();
  
  $scope.title = '微言大义';
  $scope.label = {
    'public': '同步发表',
    'visibility': '分享至'
  };
  $scope.word = {};

  // if (draftword) {
  //   $scope.word = draftword;
  // } else {
  //   $scope.word = {};
  // }

  // $scope.testItems = [
  //   { id:'001', title:'Group A'},
  //   { id:'002', title:'Group B'},
  //   { id:'003', title:'Group C'}
  // ];

  $scope.keyPressed = function(evt) {
    if (evt.keyCode && evt.keyCode === 13) {// key 'enter' pressed
      searchContent($scope.queryContent, $scope, searchService);
    } else if (evt.keyCode && evt.keyCode === 27) {
      console.log('esc pressed');
      $scope.queryContent = '';
    }
  }; //ng-keypress="keyPressed($event);"
  

  $scope.select = function(content) {
    console.log('select content:', content);
    $scope.showleft = true;
    if (!_.contains($scope.referredContents, content)) {
      $scope.referredContents.push(content);
    } else {
      console.log('exist!');
    }
  }
  $scope.removeContent = function(index) {
    $scope.referredContents.splice(index, 1);
    // console.log('after remove referredContents length =', $scope.referredContents.length);
    if ($scope.referredContents.length === 0) {
      $scope.showleft = false;
    }
  }

  $scope.$watch('queryContent', function(current, previous) {
    if (!current || !current.length) {
      $scope.contents = [];
    }
  });

  $timeout(function(){
    // $('#shareTo').dropdown();
    $('#pluginOpt a.item').on('click', pluginOptHandler.activate);
  },10);

  var pluginOptHandler = {
    activate: function() {
      console.log($(this).attr('data-value'));
      $(this)
      .addClass('active')
      .closest('.ui.menu')
      .find('.item')
      .not($(this))
      .removeClass('active');
    }
  }

  $scope.selectShareTo = function(type, item) {
    console.log('selectShareTo', type, item);
    var shareTo;
    if (!item) {
      shareTo = type;
    } else {
      shareTo = item;
    }

    if (shareTo === 'public' || shareTo === 'friends') {
      $scope.showFriendSearch = false;
      $scope.selectedGroup = shareTo;
      $scope.selectedGroups = [];
      $scope.selectedUsers = [];
      $scope.selectedUser = '';
    } else if (shareTo === 'onlyme') {
      $scope.showFriendSearch = false;
      $scope.selectedUser = shareTo;
      $scope.selectedGroup = '';
      $scope.selectedGroups = [];
      $scope.selectedUsers = [];
    } else if (shareTo === 'someone') {
      $scope.showFriendSearch = true;
      $scope.selectedGroup = '';
      $scope.selectedUser = '';
    } else {
      if (type && type === 'group') {
        $scope.selectedGroup = '';
        $scope.selectedUser = '';
        if (!_.contains($scope.selectedGroups, shareTo)) {
          $scope.selectedGroups.push(shareTo);
        }
      } else if (type && type === 'user') {
        $scope.selectedGroup = '';
        $scope.selectedUser = '';
        if (!_.contains($scope.selectedUsers, shareTo)) {
          $scope.selectedUsers.push(shareTo);
        }
      } 
    }
    // console.log('$scope.selectedGroup', $scope.selectedGroup);
    // console.log('$scope.selectedUser', $scope.selectedUser);
    // console.log('$scope.selectedGroups', $scope.selectedGroups);
    // console.log('$scope.selectedUsers', $scope.selectedUsers);
  }; 

  $scope.removeGroup = function(index) {
    $scope.selectedGroups.splice(index, 1);
  };

  var clearWord = function() {
    $scope.word = {};
  };

  var clearContents = function() {
    $scope.queryContent = '';
    $scope.referredContents = [];
    $scope.showleft = false;
  }

  var writeSuccess = function(data, status) {
    if (data.status === 200) {
      clearWord();
      resetPrivacy();
      clearContents();
      $('#shareTo').dropdown('set text', 'public');
    } else {
      console.log(data);
    }
  };

  var writeFail = function(data, status) {
    console.log(data, status);
  };

  $scope.postWord = function() {
    if (!$scope.word.word || !$scope.word.word.length) {
      return ;
    }
    var data = {};
    $scope.word.via = 'web';
    $scope.word.contentIds = [];
    // $scope.word.contentIds = $scope.referredContents;
    _.each($scope.referredContents, function(element, index, list) {
      $scope.word.contentIds.push(element.id);
    });

    data.word = $scope.word;
    data.privacy = {
      'allowComment': true,
      'allowReshare': true
    };
    if ($scope.selectedUser === 'onlyme') {
      data.privacy.sharedGroups = [];
      data.privacy.sharedUsers = ['onlyme'];
    } else if ($scope.selectedGroup === 'public' || $scope.selectedGroup === 'friends') {
      data.privacy.sharedUsers = [];
      data.privacy.sharedGroups = [$scope.selectedGroup];
    } else {
      data.privacy.sharedGroups = [];
      _.each($scope.selectedGroups, function(element, index, list) {
        data.privacy.sharedGroups.push(element.id);
      });
      data.privacy.sharedUsers = [];
      _.each($scope.selectedUsers, function(element, index, list) {
        data.privacy.sharedUsers.push(element.id);
      });
    }

    console.log('post word...');
    console.log(data);
    wordFactory.post(data, writeSuccess, writeFail);
  };

  // $('#wordForm.ui.form').form(
  //   {
  //     wordText: {
  //       identifier: 'word-text',
  //       rules: [{
  //         type: 'empty',
  //         prompt: 'Please say something...'
  //       }]
  //     }
  //   },
  //   {
  //     onSuccess:postWord
  //   }
  // );
  
  var searchContent = function(q, scope, remoteService) {
    if (!q) {
      scope.contents = [];
      return;
    }

    var onSuccess = function(data, status) {
      console.log(status, data);
      if (status && status === 200) {
        scope.contents = data.result;
      }
    }
    var onFail = function(status, data) {
      console.error(status, data);
    }

    remoteService.searchByLimit(q, 5, onSuccess, onFail);
  }

});

module.factory('wordFactory', function($http, userService){
  var _word;
  return {
    post: function(data, success, failure) {
      data.word.author = userService.getUserLocal();
      $http.post('/word/write', data, {method:'POST'}).success(success).error(failure);
    }
  }
});