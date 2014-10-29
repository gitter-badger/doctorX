var statusFn = require('./fn');

// exports.update = function * (next) {
//   console.log('update status...', this.req.body);
//   var xx = statusFn();
//   yield next;
// }

exports.getFollowingFeeds = function * (next) {
  try {
    var feeds = yield statusFn.getMyFollowingStream(this.req.me, this.query.lastStatusId, this.query.pageCount);
    this.body = { 'status': 200, 'result': feeds };
  } catch (err) {
    console.error('status middleware [getFollowingFeeds] error', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}

exports.getFollowingFeedsAdv = function * (next) {
  try {
    var feeds = yield statusFn.getMyFollowingStreamAdv(this.req.me, this.query.lastStatusId, this.query.pageCount);
    this.body = { 'status': 200, 'result': feeds };
  } catch (err) {
    console.error('status middleware [getFollowingFeedsAdv] error', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}

exports.getSubscribingFeedsAdv = function * (next) {
  try {
    var feeds = yield statusFn.getMySubscribeStreamAdv(this.req.me, this.query.lastStatusId, this.query.pageCount);
    this.body = { 'status': 200, 'result': feeds };
  } catch (err) {
    console.error('status middleware [getSubscribingFeedsAdv] error', err);
    this.body = { 'status': 500, 'err': err.message };
  }
}