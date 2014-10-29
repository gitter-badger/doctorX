'use strict';
var config = require('../../config/appConfig');
var redis = require('redis');
var store = redis.createClient();
var pub = redis.createClient();
pub.select(7);

var thunkify = require('thunkify');
var uuid = require('node-uuid');

store.smembers = thunkify(store.smembers);
store.sismember = thunkify(store.sismember);
store.srem = thunkify(store.srem);
store.sinter = thunkify(store.sinter);
store.sdiff = thunkify(store.sdiff);
store.scard = thunkify(store.scard);
store.get = thunkify(store.get);
store.hgetall = thunkify(store.hgetall);
store.incrby = thunkify(store.incrby);
store.sadd = thunkify(store.sadd);
store.hmset = thunkify(store.hmset);
store.expire = thunkify(store.expire);
store.ttl = thunkify(store.ttl);
store.persist = thunkify(store.persist);

// var mongoose = require('mongoose');
// var UserMongo = mongoose.model('User');
var userFn = require('../user/fn');
var groupFn = require('../group/fn');
var imFn = require('../im/fn');

var friendFn = {
  getIVQuota: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    return yield haveQuota(me);
  },
  addQuota: function *(me, quantity) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!quantity) {
      quantity = 1;
    }
    return yield store.incrby('ivquota:u:' + me, quantity);
  },
  genIVcode: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var quota = yield haveQuota(me);
    if (quota > 0) {
      var ivcode = uuid.v1();
      yield store.sadd('ivcodes:u:' + me, ivcode);
      
      var ivcodeHash = {
        owner: me,
        status: 0,
        expAt: (Date.now() + config.IVCODE_EXPIRE * 1000)
      };

      var reply = yield [store.hmset('ivcode:' + ivcode, ivcodeHash), store.expire('ivcode:' + ivcode, config.IVCODE_EXPIRE)];
      if (reply[0] === 'OK' && reply[1] === 1) {
        yield this.addQuota(me, -1);
      }
      return { code:ivcode, hash:ivcodeHash };
    } else {
      throw new Error('no quota to gen ivcode');
    }
  },
  genGRcode: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var grcode = uuid.v1();
    yield store.sadd('grcodes:u:' + me, grcode);

    var grcodeHash = {
      owner: me,
      status: 0,
      expAt: (Date.now() + config.GRCODE_EXPIRE * 1000)
    };

    yield [store.hmset('grcode:' + grcode, grcodeHash), store.expire('grcode:' + grcode, config.GRCODE_EXPIRE)];
    
    return { code:grcode, hash:grcodeHash };
  },
  validateIVcode: function *(ivcode) {
    return yield [store.hgetall('ivcode:' + ivcode), store.ttl('ivcode:' + ivcode)];
  },
  findFriendByGRcode: function *(grcode) {
    if (!grcode || !grcode.length) {
      throw new Error('missing grcode');
    }
    var grcodeHash = yield store.hgetall('grcode:' + grcode);
    if (!grcodeHash) {
      throw new Error('grcode expired or never existed');
    }
    if (grcodeHash.status == '1' || grcodeHash.status == 1) {
      throw new Error('grcode disabled');
    } else {
      return grcodeHash.owner;
    }
  },
  redeemIVcode: function *(ivcode, me) {
    if (!me || !me.length) {
      throw new Error('missing opter');
    }
    var ttl = yield store.ttl('ivcode:' + ivcode);
    if (ttl == -2) {
      throw new Error('ivcode expired or never existed');
    } else if (ttl === -1) {
      throw new Error('ivcode already used');
    } else {
      yield store.persist('ivcode:' + ivcode);
      var ivcodeHash = yield store.hgetall('ivcode:' + ivcode);
      ivcodeHash.userdBy = me;
      ivcodeHash.status = 1;
      ivcodeHash.expAt = 0;  
      yield store.hmset('ivcode:' + ivcode, ivcodeHash);
      return ivcodeHash;
    }
  },
  redeemGRcode: function *(grcode, me) {
    if (!me || !me.length) {
      throw new Error('missing opter');
    }
    var ttl = yield store.ttl('grcode:' + grcode);
    if (ttl == -2) {
      throw new Error('grcode expired or never existed');
    } else if (ttl === -1) {
      throw new Error('grcode already used');
    } else {
      yield store.persist('grcode:' + grcode);
      var grcodeHash = yield store.hgetall('grcode:' + grcode);
      grcodeHash.userdBy = me;
      grcodeHash.status = 1;
      grcodeHash.expAt = 0;  
      yield store.hmset('grcode:' + grcode, grcodeHash);
      return grcodeHash.owner;
    }
  },
  listMyIVcodes: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var ivcodeEntries = yield store.smembers('ivcodes:u:' + me);
    yield populateIVcodeEntries(ivcodeEntries);
    return ivcodeEntries;
  },
  follow: function *(me, target) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!target || !target.length) {
      throw new Error('missing follow target');
    }
    var check = yield this.checkAlreadyFollowed(me, target);
    if (!check) {
      var reply = yield [store.sadd('following:u:' + me, target), store.sadd('followers:u:' + target, me)];
      pub.publish('relation', JSON.stringify({ from:me, opt:'follow', target:target }));
      return reply;
    } else {
      throw new Error('already followed');
    }
  },
  unfollow: function *(me, target) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!target || !target.length) {
      throw new Error('missing follow target');
    }
    var check = yield this.checkAlreadyFollowed(me, target);
    if (check) {
      
      // take care of the related groups thing
      var quitGroupReply = yield groupFn.quitFromAllGroups(me, target);
      console.log('quitGroupReply', quitGroupReply);
      
      var reply = yield [store.srem('following:u:' + me, target), store.srem('followers:u:' + target, me)];
      pub.publish('relation', JSON.stringify({ from:me, opt:'unfollow', target:target }));
      return reply;
    } else {
      throw new Error('not followed before');
    }

  },
  checkAlreadyFollowed: function *(me, target) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!target || !target.length) {
      throw new Error('missing follow target');
    }
    var reply = yield [store.sismember('following:u:' + me, target), store.sismember('followers:u:' + target, me)];
    if ((reply[0] + reply[1]) > 0) {
      return true;
    } else {
      return false;
    }
  },
  listAllFollowing: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var entries = yield store.smembers('following:u:' + me);
    return yield [ userFn.populateUsers(entries), store.scard('following:u:' + me) ];
  },
  listAllFollower: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var entriesMutual = yield store.sinter('followers:u:' + me, 'following:u:' + me);
    var entriesIgnored = yield store.sdiff('followers:u:' + me, 'following:u:' + me);

    return yield [ userFn.populateUsers(entriesMutual), userFn.populateUsers(entriesIgnored) ];
  },
  listMutualFriendIds: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    return yield store.sinter('followers:u:' + me, 'following:u:' + me);
  },
  listOnlineFriends: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var entries = yield imFn.listOnlineFriends(me);
    return yield [ userFn.populateUsers(entries) ];
  }

}
module.exports = friendFn;

var populateIVcodeEntries = function *(entries) {
  for (var i = 0; i < entries.length; i++) {
    var code = entries[i];
    entries[i] = yield store.hgetall('ivcode:' + code);
    entries[i].ivcode = code;
  };
}

var haveQuota = function *(me) {
  return yield store.get('ivquota:u:' + me);
}