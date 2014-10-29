'use strict';

var parser = require('co-body');
var bodiedReq = function * (next) {
  this.req.body = yield parser(this);
  yield next;
};

module.exports = bodiedReq;