'use strict';

exports.handleGetCustomDic = function *(next) {
  console.log('%s %s', this.method, this.url);
  // this.type = 'text/plain; charset=utf-8';

  this.body = '柬按';
}

exports.handleHeadCustomDic = function * (next) {

  console.log('%s %s', this.method, this.url);

  this.set({
    'ETags': '5',
    'Last-Modified': '1234567'
  });
  this.body = "";
}