'use strict';

var myApp = angular.module('myApp');
myApp.config(['$routeProvider', '$locationProvider', '$httpProvider', 
  function($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.responseInterceptors.push('httpInterceptor');

    $routeProvider.
      when('/login', {
        templateUrl: 'app/auth/login.html',
        // controller: 'auth.loginCtrl',

      }).
      when('/register', {
        templateUrl: 'app/auth/register.html'
      }).
      when('/home/:whichFeed', {
        templateUrl: 'app/home/home.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/action/create', {
        templateUrl: 'app/content/create.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/home/:contentId', {
        templateUrl: 'app/content/home.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/moduleA', {
        templateUrl: 'app/moduleA/view.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/content/live/:roomKey', {
        templateUrl: 'app/room/room.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/circle', {
        templateUrl: 'app/circle/relation.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/setting', {
        templateUrl: 'app/setting/setting.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      when('/fav', {
        templateUrl: 'app/poi/fav.html',
        resolve: {
          checkUser: checkUserFn
        }
      }).
      otherwise({
        redirectTo: '/home/following'
      });
    $locationProvider.html5Mode(false).hashPrefix('!');
  }
]);

myApp.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '@focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === "true") { 
          // console.log('trigger',value);
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
    }
  };
});

myApp.directive("keepScroll", function(){
  return {
    controller : function($scope){
      var element = 0;
      this.setElement = function(el){
        element = el;
      }
      this.addItem = function(item){
        // console.log("Adding item", item, item.clientHeight);
        element.scrollTop = (element.scrollTop + item.clientHeight); //1px for margin
        // $(element).animate({
        //   scrollTop:element.scrollTop + item.clientHeight
        // });
      };
    },
    link : function(scope,el,attr, ctrl) {
      ctrl.setElement(el[0]);
    }
  };
});

myApp.directive("scrollItem", function(){
  return{
    require : "^keepScroll",
    link : function(scope, el, att, scrCtrl){
      scrCtrl.addItem(el[0]);
    }
  }
});

myApp.factory('optMessageService', function($timeout) {
  var currentTimeout;
  var show = function(type) {
    if (currentTimeout) {
      $timeout.cancel(currentTimeout);
    };
    
    if (type) {
      $('#optMsg').addClass(type);
    }
    $('#optMsg').removeClass('hidden');
    $('#optMsg').addClass('visible');
    currentTimeout = $timeout(function() {
      $('#optMsg').fadeOut(500, function() {
        if (type) {
          $('#optMsg').removeClass(type);
        }
        $('#optMsg').removeClass('visible');
        $('#optMsg').addClass('hidden');  
      });
    }, 5000);
  }

  return {
    successMsg: function() {
      show('success');
    },
    infoMsg: function() {
      show();
    },
    failMsg: function() {
      show('error');
    }
  }
  
});

myApp.factory('uploadService', function($http) {
  return {
    getUploader: function(uploadToken) {
      var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        browse_button: 'openNativeDir',       //上传选择的点选按钮，**必需**
        // uptoken_url: '/file/uploadToken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        // downtoken_url: '/downtoken',
        // Ajax请求downToken的Url，私有空间时使用,JS-SDK将向该地址POST文件的key和domain,服务端返回的JSON必须包含`url`字段，`url`值为该文件的下载地址
        uptoken : uploadToken, //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
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
      return uploader;
    },
    getUploadToken: function(success, failure) {
      $http.get('/file/uploadToken', { method:'GET' }).success(success).error(failure);
    }
  }
});