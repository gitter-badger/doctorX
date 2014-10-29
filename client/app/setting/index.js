'use strict';
var module = angular.module('setting', []);

module.controller('ivCtrl', function($scope, settingService) {
  $scope.ivquota = 0;
  $scope.ivcode = null;

  var refreshIVQuota = function(){
    settingService.getIVQuota(
      function(data, status) {
        $scope.ivquota = data.quota;
      },
      function(data, status) {
        console.error(data, status);
      }
    );  
  }

  $scope.ivBtnClick = function() {
    $('#ivLoader').addClass('active');
    settingService.genIVcode(
      function(data, status) {
        $('#ivcodeSegment').removeClass('rosered');
        $('#ivcodeSegment').addClass('lightnavy');
        // console.log(data.ivcode.expAt);
        $scope.ivcode = data.ivcode;

        $('#ivLoader').removeClass('active');
        refreshIVQuota();
      },
      function(data, status) {
        $('#ivcodeSegment').removeClass('lightnavy');
        $('#ivcodeSegment').addClass('rosered');
        $scope.ivcode = data.err;
        $('#ivLoader').removeClass('active');
        refreshIVQuota();
      }
    );
  };
  refreshIVQuota();

});

module.controller('grCtrl', function($scope, settingService) {
  $scope.grcode = null;
  $scope.grBtnClick = function() {
    $('#grLoader').addClass('active');
    settingService.genGRcode(
      function(data, status) {
        $('#grcodeSegment').removeClass('rosered');
        $('#grcodeSegment').addClass('lemongreen');
        // data.grcode.hash.expAt = (new Date(data.grcode.hash.expAt)).toLocaleDateString() 
        //                           + ' ' + (new Date(data.grcode.hash.expAt)).toLocaleTimeString();
        $scope.grcode = data.grcode;
        $('#grLoader').removeClass('active');
      },
      function(data, status) {
        $('#grcodeSegment').removeClass('lemongreen');
        $('#grcodeSegment').addClass('rosered');
        $scope.grcode = data.err;
        $('#grLoader').removeClass('active');
      }
    );
  }
});

module.controller('profileCtrl', function($scope) {

});

module.factory('settingService', function($http) {
  return {
    getIVQuota:function(success, failure) {
      $http.get('/friend/getIVQuota', { method:'GET' }).success(success).error(failure);
    },
    genIVcode:function(success, failure){
      $http.get('/friend/genIVcode', { method:'GET' }).success(success).error(failure);
    },
    genGRcode:function(success, failure){
      $http.get('/friend/genGRcode', { method:'GET' }).success(success).error(failure);
    }
  }
})