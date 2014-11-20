'use strict';
var module = angular.module('room', []);

module.controller('roomHomeCtrl', function($scope, $routeParams, $timeout, $location, contentFactory, mySocket, roomService, userService) {
  // var searchParams = $location.search();
  // console.log('searchParams', searchParams);
  // console.log('current path', $location.path());
  $scope.MSG_LIMIT = 120;
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

  var uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4',    //上传模式,依次退化
      browse_button: 'openNativeDir',       //上传选择的点选按钮，**必需**
      uptoken_url: '/file/uploadToken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
      // downtoken_url: '/downtoken',
      // Ajax请求downToken的Url，私有空间时使用,JS-SDK将向该地址POST文件的key和domain,服务端返回的JSON必须包含`url`字段，`url`值为该文件的下载地址
      // uptoken : '<Your upload token>', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
      // unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
      // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
      domain: 'http://doctorx-public.qiniudn.com',   //bucket 域名，下载资源时用到，**必需**
      container: 'container1',           //上传区域DOM ID，默认是browser_button的父元素，
      max_file_size: '100mb',           //最大文件体积限制
      max_retries: 3,                   //上传失败最大重试次数
      dragdrop: true,                   //开启可拖曳上传
      drop_element: 'container1',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
      chunk_size: '4mb',                //分块上传时，每片的体积
      auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传,
      //x_vals : {
      //    自定义变量，参考http://developer.qiniu.com/docs/v6/api/overview/up/response/vars.html
      //    'time' : function(up,file) {
      //        var time = (new Date()).getTime();
                // do something with 'time'
      //        return time;
      //    },
      //    'size' : function(up,file) {
      //        var size = file.size;
                // do something with 'size'
      //        return size;
      //    }
      //},
      init: {
          'FilesAdded': function(up, files) {
              // plupload.each(files, function(file) {
              //     // 文件添加进队列后,处理相关的事情
              //     var progress = new FileProgress(file, 'fsUploadProgress');
              //     progress.setStatus("等待...");
              // });
            console.log('files', files);
            console.log('source:%s, native:%s', files[0].getSource(), files[0].getNative());
            
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
            


          },
          'BeforeUpload': function(up, file) {
                 // 每个文件上传前,处理相关的事情
          },
          'UploadProgress': function(up, file) {
                 // 每个文件上传时,处理相关的事情
              
              
          },
          'FileUploaded': function(up, file, info) {
                 // 每个文件上传成功后,处理相关的事情
                 // 其中 info 是文件上传成功后，服务端返回的json，形式如
                 // {
                 //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                 //    "key": "gogopher.jpg"
                 //  }
                 // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html

                 // var domain = up.getOption('domain');
                 // var res = parseJSON(info);
                 // var sourceLink = domain + res.key; 获取上传成功后的文件的Url
          },
          'Error': function(up, err, errTip) {
                 //上传出错时,处理相关的事情
            console.log('err:%s, errTip:%s', err, errTip);
          },
          'UploadComplete': function() {
                 //队列文件处理完毕后,处理相关的事情
            console.log('upload complete!');
          }
          // ,
          // 'Key': function(up, file) {
          //     // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
          //     // 该配置必须要在 unique_names: false , save_key: false 时才生效

          //     var key = "";
          //     // do something with key here
          //     return key
          // }
      }

  });



  uploader.bind('UploadProgress', function(up, file) {
    // console.log('inside $scope means:', $scope);
    $scope.upPercentage = file.percent;
    $scope.upSpeed = up.total.bytesPerSec;
    $scope.$apply();
    // console.log('%s uploaded, speed:', $scope.upPercentage, $scope.upSpeed );
  });
  
  var updateTitle = function(percent, speed) {
    console.log('title updated');
    $scope.upPercentage = percent;
    $scope.upSpeed = speed;
    $scope.$apply();
  }

  uploader.bind('FileUploaded', function(up, file, info) {
    console.log('hello man, a file is uploaded with file.percent:', file.percent);
    console.log('FileUploaded response: %s, status: %s', info.response, info.status);
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

