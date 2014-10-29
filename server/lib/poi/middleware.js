'use strict';

var poiFn = require('./fn');

exports.subscribe = function *(next) {
  var contentIds = this.req.body.contentIds;
  try {
    var count = yield poiFn.subscribe(this.req.me, contentIds);
    this.body = { 'status': 200, 'reply': count };
  } catch (err) {
    console.error('POI middleware fn:subscribe err', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}

exports.unsubscribe = function *(next) {
  var contentIds = this.req.body.contentIds;
  try {
    var count = yield poiFn.unsubscribe(this.req.me, contentIds);
    this.body = { 'status': 200, 'reply': count };
  } catch (err) {
    console.error('POI middleware fn:unsubscribe err', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}

exports.getPOIs = function *(next) {
  try{
    var pois = yield poiFn.getPOIsAdv(this.req.me);
    this.body = { 'status': 200, 'result': pois };
  } catch (err) {
    console.error('POI middleware fn:getPOIs err', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}