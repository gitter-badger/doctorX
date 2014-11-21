'use strict';
var module = angular.module('room', []);

module.controller('roomHomeCtrl', function($scope, $routeParams, $timeout, $location, 
  contentFactory, mySocket, roomService, userService, uploadService) {

  // var searchParams = $location.search();
  // console.log('searchParams', searchParams);
  // console.log('current path', $location.path());

  $scope.MSG_LIMIT = 120; // for max letter amount of one message

  var _room = $routeParams.roomKey;
  $scope.msgs = [];
  $scope.predicate = 'ts';
  $scope.me = userService.getUserLocal();


  $scope.iconcolor = ['chat','icon', 'red'];
  $scope.$watch('msg', function(current, previous) {
    console.log('current msg, previous msg', current, previous);
    if (current === 'go') {
      $scope.iconcolor.push('outline');
    } else if (previous === 'go') {
      var index = $scope.iconcolor.indexOf('outline');
      if (index >= 0) {
        $scope.iconcolor.splice(index, 1);  
      }
    }
  });

  if (!_room || !_room.length) {
    _room = contentFactory.getCurrentContent();
  }

  // still null, then go back to home page
  if (!_room || !_room.length) {
    $location.path('/');
  }

  var onTalk = function(evtData) {
    $scope.msgs.push({ 'msgId':evtData.payload.msgId, 'msg':evtData.payload.msg, 'ts':evtData.ts + '', 'creator':evtData.userId });
    reloadRMDimmer($timeout);
    // $scope.toBottom();
  }

  var onWord = function(evtData) {
    console.log('word activity:', evtData);
  }

  var onJoin = function(evtData) {
    console.log('join activity:', evtData);
  }

  var onLeave = function(evtData) {
    console.log('leave activity:', evtData);
  }
  
  var onRoomActivity = function(evt, data) {
    console.log('onRoomActivity got evt', evt, data);
    // if (data.type === 'talk') {
    //   $scope.msgs.push({ 'msgId':data.payload.msgId, 'msg':data.payload.msg, 'ts':data.ts + '', 'creator':data.userId });
    // }

    switch (data.type) {
      case 'talk':
        onTalk(data);
        break;
      case 'word':
        onWord(data);
        break;
      case 'join':
        onJoin(data);
        break;
      case 'leave':
        onLeave(data);
        break;
      default: break;
    }
  }

  $scope.$on('socket:roomActivity', onRoomActivity);
  // $scope.$on('$destroy', function() {
  //   console.log('roomHomeCtrl destroyed');
  // })
  mySocket.joinRoom(_room);

  // var initView = function(timeout) {
  //   timeout(function() {
  //     $('.item.msg').dimmer({on:'hover'});
  //     $('.item.feedCard').dimmer({on:'hover'});
  //   }, 100);
  // }

  $scope.contentProfile = contentFactory.getCurrentContentProfile();
  if (!$scope.contentProfile) {
    contentFactory.loadContentProfile(_room, function(data, status) {
      $scope.contentProfile = data.reply;
      contentFactory.setCurrentContentProfile(data.reply);
    }, function(data, status) {
      console.error('data, status', data, status);
    });
  }

  $scope.reloadRM = function() {
    roomService.loadRMHistory(_room, function(data, status) {
      console.log('rmhistory:', data.result);
      $scope.msgs = $scope.msgs.concat(data.result);

      reloadRMDimmer($timeout);


    }, function(data, status) {
      console.error(data.err);
    });
  };

  $scope.reloadRoomUsers = function() {
    roomService.whoInRoom(_room, function(data, status) {
      console.log('users in room', data.result);
      $scope.users = data.result;
    }, function(data, status) {
      console.error(data, status);
    });
  };

  $scope.keydown = function(evt) {
    if (evt && evt.keyCode === 13) {
      if (_room && $scope.msg) {
        mySocket.sendRM(_room, $scope.msg);
        // var msg = { 'msg':$scope.msg, 'ts':Date.now() + '', 'creator':$scope.me };
        // $scope.msgs.push(msg);
        // reloadTimeDimmer($timeout, 1);
      }
      $scope.msg = '';
      $scope.toTop();
      $('.shape').shape();

    } else if (evt && evt.keyCode === 27) {
      $scope.msg = '';
    }
  };

  var vh = $(window).height();
  // var vh = $(window).height() * 0.65;

  $(document).on('scroll', function(evt) {
    // console.log('document height', $(document).height());
    if ($(document).scrollTop() < ($(document).height()-vh) * 0.25) {
      if ( $('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
        $('#backToTop').transition({
          'animation': 'fade down out'
        });
      }

      if ( !$('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
        $('#downToBottom').transition({
          'animation': 'fade up in'
        });
      }

    } else if ($(document).scrollTop() >= ($(document).height()-vh) * 0.75) {
      if ( $('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
        $('#downToBottom').transition({
          'animation': 'fade up out'
        });
      }
      if ( !$('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
        $('#backToTop').transition({
          'animation': 'fade down in'
        });
      }
    } else {
      if ( !$('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
        $('#backToTop').transition({
          'animation': 'fade down in'
        });
      }
      if ( !$('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
        $('#downToBottom').transition({
          'animation': 'fade up in'
        });
      }
    }
  });

  // $('#roomTalkContainer').on('scroll', function(evt) {
  //   // console.log('roomContainer height(), scrollHeight, scrollTop', 
  //     // $('#roomContainer').height(), $('#roomContainer')[0].scrollHeight, $('#roomContainer').scrollTop());
  //   if ($('#roomTalkContainer').scrollTop() < ($('#roomTalkContainer')[0].scrollHeight - vh) * 0.25) {
  //     if ( $('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
  //       $('#backToTop').transition({
  //         'animation': 'fade down out'
  //       });
  //     }

  //     if ( !$('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
  //       $('#downToBottom').transition({
  //         'animation': 'fade up in'
  //       });
  //     }

  //   } else if ($('#roomTalkContainer').scrollTop() >= ($('#roomTalkContainer')[0].scrollHeight - vh) * 0.75) {
  //     if ( $('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
  //       $('#downToBottom').transition({
  //         'animation': 'fade up out'
  //       });
  //     }
  //     if ( !$('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
  //       $('#backToTop').transition({
  //         'animation': 'fade down in'
  //       });
  //     }
  //   } else {
  //     if ( !$('#backToTop').transition('is visible') && !$('#backToTop').transition('is animating')) {
  //       $('#backToTop').transition({
  //         'animation': 'fade down in'
  //       });
  //     }
  //     if ( !$('#downToBottom').transition('is visible') && !$('#downToBottom').transition('is animating')) {
  //       $('#downToBottom').transition({
  //         'animation': 'fade up in'
  //       });
  //     }
  //   }
  // });
  

  $scope.toTop = function() {
    $('html, body').animate({
      scrollTop: 0
    }, 300);
  }
  $scope.toBottom = function() {
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 300);
  }

  // $scope.toTop = function() {
  //   $('#roomTalkContainer').animate({
  //     scrollTop: 0
  //   }, 500);
  // }
  // $scope.toBottom = function() {
  //   $('#roomTalkContainer').animate({
  //     scrollTop: $('#roomTalkContainer')[0].scrollHeight
  //   }, 500);
  // }



  $('.shape').shape();
  $scope.shapeflipUp = function() {
    $('.shape').shape('flip up');
  }
  $scope.shapeflipDown = function() {
    $('.shape').shape('flip down');
  }

  $scope.reloadRM();
  $scope.reloadRoomUsers();

  
  gotNewRoomMsg($timeout);

  $('.roomDashboard .ui.header').transition({
    'animation': 'fade up in'
  });

  $scope.upPercentage = 0;
  $scope.upSpeed = 0;

  uploadService.getUploadToken(function(data, status) {
    var uploader = uploadService.getUploader(data.uptoken);

    uploader.bind('FilesAdded', function(up, files) {
      // console.log('files', files);
      // console.log('source:%s, native:%s', files[0].getSource(), files[0].getNative());
      $.each(files, function(){
        var img = new mOxie.Image();
        img.onload = function() {
          this.embed($('#preview').get(0), {
            width: 100,
            height: 100,
            crop: true
          });
        };
        img.onembedded = function() {
          this.destroy();
        };
        img.onerror = function() {
          this.destroy();
        };
        img.load(this.getSource());     
      });
    });

    uploader.bind('UploadProgress', function(up, file) {
      // console.log('inside $scope means:', $scope);
      $scope.upPercentage = file.percent;
      $scope.upSpeed = up.total.bytesPerSec;
      $scope.$apply();
      // console.log('%s uploaded, speed:', $scope.upPercentage, $scope.upSpeed );
    });
    
    // var updateTitle = function(percent, speed) {
    //   console.log('title updated');
    //   $scope.upPercentage = percent;
    //   $scope.upSpeed = speed;
    //   $scope.$apply();
    // }

    uploader.bind('FileUploaded', function(up, file, info) {
      console.log('hello man, a file is uploaded with file.percent:', file.percent);
      console.log('FileUploaded response: %s, status: %s', info.response, info.status);
    });
  }, function(data, status) {
    console.error('uploadService.getUploadToken', data, status);
  });

  

})


module.factory('roomService', function($http) {
  return {
    whoInRoom: function(roomKey, success, failure) {
      $http.get('/online/friends', { method:'GET', params:{ 'roomKey':roomKey } }).success(success).error(failure);
    },
    loadRMHistory: function(roomKey, success, failure) {
      $http.get('/online/rmhistory', { method:'GET', params:{ 'roomKey':roomKey } }).success(success).error(failure);
    }
  }
})


var gotNewRoomMsg = function(timeout) {
  // $('.ui.label.black').addClass('red');
  timeout(function() {
    $('.ui.label.black').transition('fade up').transition('fade up');  
  }, 100);
  
}

var reloadRMDimmer = function(timeout) {
  timeout(function() {
    $('.item.msg').dimmer({
      on:'hover',
      duration: {
        show : 300,
        hide : 300
      }
    });
    $('.item.feedCard').dimmer({on:'hover'});
// 
    // $('.shape').shape();
// 
  }, 100);
}

