'use strict';

var module = angular.module('chat', []);

module.controller('chatCtrl', function($scope, $timeout) {
  $scope.chatRegion = 'friends';

  $timeout(function() {
    $('#chatBarMenu a.item').on('click', handler.activate);
  }, 10);
  $timeout(function() {
    $('#chatBarMenu a.item').on('click', handler.activate);
  }, 100);

});

module.controller('privateChatCtrl', function($scope, mySocket, privateChatService, _, $rootScope, optMessageService) {
  $scope.onlineFriends = [];
  $scope.keydown = function(evt) {
    if (evt && evt.keyCode === 13) {
      
      mySocket.talk($scope.whichRoom, $scope.msg);

      // mySocket.emit('dm', {to:$scope.whichRoom, msg:$scope.msg});

    } else if (evt && evt.keyCode === 27) {
      $scope.msg = '';
    }
  };

  var refreshOnlineFriendsList = function(){
    privateChatService.getOnlineFriends(function(data, status) {
      // console.log('onlineFriends:', data.result);
      $scope.onlineFriends = data.result;
    }, function(data, status) {
      console.error(data, status);
    });
  }

  // console.log($("#privateChatBox").offset().top);
  

  $scope.$on('socket:friendOn', function(evt, data) {
    console.log('privateChatCtrl got evt friendOn', evt, data);
    refreshOnlineFriendsList();

    $rootScope.sysMsg = data.payload.username + ' landed.';
    optMessageService.infoMsg();

  });

  $scope.$on('socket:friendOff', function(evt, data) {
    console.log('privateChatCtrl got evt friendOff', evt, data);
    refreshOnlineFriendsList();

    $rootScope.sysMsg = data.payload.username + ' left.';
    optMessageService.infoMsg();
  });

  refreshOnlineFriendsList();

  $scope.opendmBox = function(user) {
    $rootScope.$broadcast('opendmBox', { 'user': user });
  }

});

module.controller('dmBoxCtrl', function($scope, $timeout, mySocket, privateChatService) {
  console.log('dmBoxCtrl init');
  var _currentUserId;
  $scope.msgs = [];
  isolateScrollableBind();

  $scope.$on('opendmBox', function(evt, data) {
    $('#dmBoxBar').sidebar('toggle');
    var user = data.user;
    
    if (_currentUserId != user._id) {
      _currentUserId = user._id;
      $scope.talkToWhom = user;

      privateChatService.loadDMHistory(_currentUserId, function(reply, status) {
        $scope.msgs = $scope.msgs.concat(reply.result);
        reloadTimeDimmer($timeout, 50);
      }, function(reply, status) {
        console.error(reply, status);
      });
    }

  });

  $scope.predicate = 'ts';


  $scope.$on('socket:dm', function(evt, data) {
    console.log('dmBoxCtrl got evt', evt, data, data.ts);

    if (_currentUserId && _currentUserId == data.from) {
      var msg = {
        'msg':data.payload.msg,
        'ts':data.ts + '',
        'from':data.from,
        'to':data.payload.to,
        'msgId':data.payload.msgId,
        'ua':data.payload.ua
      };

      $scope.msgs.push(msg);
      
      
      reloadTimeDimmer($timeout, 1);


    } else {
      // received msg is not from the current(or previous) user

    }

  });

  $scope.backToPrivateChat = function() {
    $('#chatBar').sidebar('toggle');
  };

  $scope.keydown = function(evt) {
    if (evt && evt.keyCode === 13) {
      if (_currentUserId && $scope.msg) {
        mySocket.sendDM(_currentUserId, $scope.msg);
        var msg = { 'msg':$scope.msg, 'ts':Date.now() + '' };
        $scope.msgs.push(msg);
        reloadTimeDimmer($timeout, 1);
      }
      $scope.msg = '';
    } else if (evt && evt.keyCode === 27) {
      $scope.msg = '';
    }
  };

  var initView = function() {
    $('.shape').shape();
  }

  initView();

});


module.factory('privateChatService', function($http) {
  return {
    getOnlineFriends: function(success, failure) {
      $http.get('/online/friends', { method:'GET' }).success(success).error(failure);
    },
    loadDMHistory: function(targetUserId, success, failure) {
      $http.get('/online/dmhistory', { method:'GET', params:{ 'targetUserId':targetUserId } }).success(success).error(failure);
    }
  }
});

var reloadTimeDimmer = function(timoutHandler, delay) {
  timoutHandler(function() {
    $('.chatline').dimmer({
      on:'hover',
      duration: {
        show : 200,
        hide : 150
      }
    });
  }, delay);
}

var gotNewDM = function(timeout) {
  $('.chat.icon').addClass('red');
  $('.chat.icon').transition('set looping').transition('pulse');
  timeout(function() {
    $('.chat.icon').transition('remove looping');
  }, 5000);
}

