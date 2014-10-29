'use strict';
var friendFn = require('./fn');

var validateIVcode = function *(next) {
  try {
    var reply = yield friendFn.validateIVcode(this.query.ivcode);
    this.body = { status:200, ivcodeHash:reply[0], codeTTL:reply[1] };
  } catch (err) {
    console.error('validateIVcode err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var follow = function *(next) {
  var data = this.req.body;
  if (!data.target || !data.target.length) {
    this.status = 500;
    this.body = { status:500, err:'missing follow target' };
    return
  } else if (data.target == this.req.me) {
    this.status = 500;
    this.body = { status:500, err:'one cannot follow oneself' };
    return
  }

  try {
    yield friendFn.follow(this.req.me, data.target);
    this.body = { status:200, target:data.target };
  } catch (err) {
    console.error('follow err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var followWithGRcode = function *(next) {
  var data = this.req.body;
  if (!data.target || !data.target.length) {
    this.status = 500;
    this.body = { status:500, err:'missing follow target' };
    return
  } else if (data.target == this.req.me) {
    this.status = 500;
    this.body = { status:500, err:'one cannot follow oneself' };
    return
  }

  if (!data.grcode || !data.grcode.length) {
    this.status = 500;
    this.body = { status:500, err:'missing grcode' };
    return
  }
  
  try {
    yield friendFn.redeemGRcode(data.grcode, this.req.me);
    yield friendFn.follow(this.req.me, data.target);
    this.body = { status:200, target:data.target };
  } catch (err) {
    console.error('follow err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var findFriendByGRcode = function *(next) {
  try {
    var reply = yield friendFn.findFriendByGRcode(this.query.grcode);
    this.body = { status:200, friendId:reply };
  } catch (err) {
    console.error('findFriendByGRcode err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var genIVcode = function *(next) {
  try {
    var ivcode = yield friendFn.genIVcode(this.req.me);
    this.body = { status:200, ivcode:ivcode };
  } catch (err) {
    console.error('genIVcode err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var genGRcode = function *(next) {
  try {
    var grcode = yield friendFn.genGRcode(this.req.me);
    this.body = { status:200, grcode:grcode };
  } catch (err) {
    console.error('genGRcode err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var getIVQuota = function *(next) {
  try {
    var quota = yield friendFn.getIVQuota(this.req.me);
    if (!quota) {
      quota = 0;
    }
    this.body = { status:200, quota:quota };
  } catch (err) {
    console.error('getIVQuota err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var alreadyFollowed = function *(next) {
  try {
    var reply = yield friendFn.checkAlreadyFollowed(this.req.me, this.query.target);
    this.body = { status:200, check:reply };
  } catch (err) {
    console.error('check alreadyFollowed err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var allFollowings = function *(next) {
  try {
    var reply = yield friendFn.listAllFollowing(this.req.me);
    this.body = { status:200, result:reply[0], count:reply[1] };
  } catch (err) {
    console.error('allFollowings err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var allFollowers = function *(next) {
  try {
    var reply = yield friendFn.listAllFollower(this.req.me);
    this.body = { status:200, mutual:reply[0], ignored:reply[1], count:(reply[0].length + reply[1].length) };
  } catch (err) {
    console.error('allFollowers err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var unfollow = function *(next) {
  var data = this.req.body;
  try {
    var reply = yield friendFn.unfollow(this.req.me, data.target);
    this.body = { status:200, target:data.body };
  } catch (err) {
    console.error('unfollow err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

exports.validateIVcode = validateIVcode;
exports.follow = follow;
exports.followWithGRcode = followWithGRcode;
exports.unfollow = unfollow;
exports.findFriendByGRcode = findFriendByGRcode;
exports.genIVcode = genIVcode;
exports.genGRcode = genGRcode;
exports.getIVQuota = getIVQuota;
exports.alreadyFollowed = alreadyFollowed;
exports.allFollowings = allFollowings;
exports.allFollowers = allFollowers;

