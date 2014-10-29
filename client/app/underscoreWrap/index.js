'use strict';

var module = angular.module('underscore', []);

module.factory('_', function() {
  return window._;
})