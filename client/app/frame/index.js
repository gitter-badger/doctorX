'use strict';

var frame = angular.module('frame', []);

frame.controller('mainframeCtrl', function($scope, $timeout, mySocket, userService, contentFactory) {
  $scope.shouldFocus = true;
  $scope.showSearch = true;
  $scope.chatBarTplt = 'app/chat/chat.html';
  $scope.sysNotesBarTplt = 'app/sysnotes/sysnotes.html';
  $scope.dmBoxTplt = 'app/chat/dmbox.html';
  
  $scope.toggleMenu = function() {
    $('#menuBar').sidebar('toggle');
  }

  $scope.toggleChat = function() {
    $('#chatBar').sidebar('toggle');
  }
  $scope.toggleSN = function() {
    $('#sysNotesBar').sidebar('toggle');
  }

  $scope.toggleSearch = function() {
    $scope.showSearch = !$scope.showSearch;
    if ($scope.showSearch) { 
      $timeout(function() {
        $('#globalSearchQ').focus();
      }, 0);
    }
  }
  // $scope.$watch('showSearch', function(current, previous) {
  //   if (current) {
  //     $('#toggleSearchBtn').addClass('red inverted');
  //   } else {
  //     $('#toggleSearchBtn').removeClass('red inverted');
  //   }
  // });
  

  // $scope.search = function() {
  //   console.log($scope.query);
  // }

  $scope.writeWord = function() {
    console.log('writeWord @', contentFactory.getCurrentContent());
    // $('#wordPostModal').modal('setting', 'transition', 'fade up').modal('show');
    $('#wordPostModal').modal('setting', 
      {
        'transition': 'fade up',
        'closable': false
      }
    ).modal('show');
  }

  $scope.writeReview = function() {
    console.log('writeReview @', contentFactory.getCurrentContent());
    $('#reviewPostModal').modal('setting', 'transition', 'fade up').modal('show');
  }

  $('#postBtn').dropdown();
  $('.ui.menu a.item').on('click', handler.activate);
  

  // $('.ui.menu a.item').state();
  
  
  // $scope.isLogin = (userService.getUserLocal() != null);
  // console.log('isLogin', $scope.isLogin);
  // userService.getUserRemote(onSuccess, onFailure);

  // $scope.$on('app:login', function (evt, data) {
  //   console.log('mainframeCtrl got event', evt, data);
  //   userService.getUserRemote(onSuccess, onFailure);
  //   $scope.isLogin = true;

    // $scope.$on('socket:news', function (evt, data) {
    //   if (data && data != '') {
    //     console.log('main got msg', data);
    //     $scope.message = data;
    //   }
    // });

  // });

  var userid = userService.getUserLocal();
  if (userid != null) {
    $scope.isLogin = true;
    initUserEnv($scope, userService, mySocket);
  } else {
    $scope.isLogin = false;
    $scope.$on('app:login', function(evt, data) {
      $scope.isLogin = true;
      console.log('mainframeCtrl got event', evt, data);
      initUserEnv($scope, userService, mySocket);
    });
  }

  $scope.$on('app:logout', function(evt, data) {
    console.log('user logout');
    // clear localstorage or cookies
    // disconnect socket
    // redirect back to login page
  });

  $scope.$on('socket:friendOn', function(evt, data) {
    console.log('mainframeCtrl got evt friendOn', evt, data);

  });

  $scope.$on('socket:dm', function(evt, data) {
    console.log('mainframeCtrl got evt friendOn', evt, data);
    gotNewDM($timeout);
  });

  

});


var initUserEnv = function(scope, userService, socket) {  
  
  var onSuccess = function(data, status) {
    scope.user = data.user;

    socket.report(data.user);
    socket.initSession();

    $('#menuBar').sidebar('show');
  }

  var onFailure = function(data, status) {
    console.log('onFailure', data);
    socket.disconnect();
  }

  userService.getUserRemote(onSuccess, onFailure);
  
}

var handler = {
  activate: function() {
    $(this)
    .addClass('active')
    .closest('.ui.menu')
    .find('.item')
    .not($(this))
    .removeClass('active');
  }
}
$('#optMsg.message .close').on('click', function() {
  $('#optMsg').removeClass('visible');
  $('#optMsg').addClass('hidden');  
});

var isolateScrollableBind = function() {
  $('.isolateScrollable' ).bind( 'mousewheel DOMMouseScroll', function ( e ) {
    var e0 = e.originalEvent,
    delta = e0.wheelDelta || -e0.detail;
    
    this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
    e.preventDefault();
  });
}