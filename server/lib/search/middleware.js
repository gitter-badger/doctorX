'use strict';

var fn = require('./fn');

exports.search = function *(next) {
  var q = this.query.q;
  console.log('q', q);
  var result = yield fn.search(q);

  // var item = {
  //     'id': '001',
  //     'name':'X医生：外科医生大门未知子 第二季 ドクターX 外科医', 
  //     'image':'/images/drama-poster-1.jpg', 
  //     'description':'在上一季中，以果敢干练的作风和高超惊人的医术，人称 “Doctor X”外科医生大门未知子（米仓凉子 饰）在早已形同腐臭泥潭一般的帝都医科大学第三医院力挽狂澜，掀起前所未有的风暴。'
  //   };
  this.body = { 'status': 200, 'result': result };

}

exports.searchByLimit = function *(next) {
  var q = this.query.q;
  var q = this.query.limit;
  var result = yield fn.searchByLimit(q, limit);
  this.body = { 'status': 200, 'result': result };
}