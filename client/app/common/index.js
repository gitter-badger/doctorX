'use strict';

var myApp = angular.module('myApp');
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