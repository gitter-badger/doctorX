'use strict';
var config = require('../../config/appConfig');
var thunkify = require('thunkify');

var uuid = require('node-uuid');

var redis = require('redis');
var store = redis.createClient();
var pub = redis.createClient();
pub.select('8');

store.smembers = thunkify(store.smembers);
store.sadd = thunkify(store.sadd);
store.srem = thunkify(store.srem);
store.sinter = thunkify(store.sinter);

store.hgetall = thunkify(store.hgetall);
store.hget = thunkify(store.hget);
store.hset = thunkify(store.hset);
store.hmset = thunkify(store.hmset);
store.hincrby = thunkify(store.hincrby);

store.del = thunkify(store.del);
store.expire = thunkify(store.expire);
store.persist = thunkify(store.persist);

store.zadd = thunkify(store.zadd);
store.zrange = thunkify(store.zrange);
store.zrangebyscore = thunkify(store.zrangebyscore);
store.zrevrangebyscore = thunkify(store.zrevrangebyscore);
store.zincrby = thunkify(store.zincrby);

var imFn = {
  listOnlineFriends: function *(me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    return yield store.sinter('followers:u:' + me, 'following:u:' + me, 'im:users');
  },
  listOnlineFriendsAdv: function *(me) {
    var entries = yield this.listOnlineFriends(me);
    return yield populateUserFromCache(entries);
  },
  getUPCache: function *(userId) {
    if (!userId || !userId.length) {
      return null;
    }
    var list = yield populateUserFromCache([userId]);
    return list[0];
  },
  land: function *(userId, userProfile, ua) {
    yield [store.sadd('im:users', userId), store.hmset('im:up:' + userId, userProfile), store.hmset('im:up:' + userId, ua)];
    yield [addRedisServerKey(['im:up:' + userId]), store.persist('im:up:' + userId)];
  },
  disconnect: function *(userId) {
    yield store.srem('im:users', userId);
    yield [store.expire('im:up:' + userId, config.IM_UP_EXPIRE)];
  },
  listJoinedRooms: function *(userId) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    return yield store.smembers('im:joined:u:' + userId);
  },
  listUsersInRoom: function *(roomKey) {
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }
    return yield store.smembers('im:joined:r:' + roomKey);
  },
  listUsersInRoomAdv: function *(roomKey) {
    var entries = yield this.listUsersInRoom(roomKey);
    return yield populateUserFromCache(entries);
  },
  addToRoom: function *(userId, roomKey) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }
    yield [store.sadd('im:joined:u:' + userId, roomKey), store.sadd('im:joined:r:' + roomKey, userId)];
    yield addRedisServerKey(['im:joined:u:' + userId, 'im:joined:r:' + roomKey]);
  },
  logJoinRoom: function *(userId, roomKey) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }

    // ---------------TODO
    yield store.zincrby('im:roomUserCount', 1, roomKey);

  },
  removeFromRoom: function *(userId, roomKey) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }
    yield [store.srem('im:joined:r:' + roomKey, userId), store.srem('im:joined:u:' + userId, roomKey)];
  },
  logLeaveRoom: function *(userId, roomKey) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }

    // ---------------TODO
    yield store.zincrby('im:roomUserCount', -1, roomKey);

  },
  logRoomTalk: function *(userId, roomKey, msgId, msg, ts) {
    if (!userId || !userId.length) {
      throw new Error('missing user');
    }
    if (!roomKey || !roomKey.length) {
      throw new Error('missing room');
    }
    if (!msgId || !msgId.length) {
      throw new Error('missing msgId');
    }
    if (!ts) {
      ts = Date.now();
    }

    yield [store.zadd('im:rm:r:' + roomKey, ts, msgId), store.hmset('im:m:' + msgId, {
      'msgId':msgId,
      'msg':msg,
      'type':'rm',
      'ts':ts,
      'target':roomKey,
      'creator':userId
    })];

  },
  logDM: function *(from, to, msgId, msg, ts) {
    if (!from || !from.length) {
      throw new Error('missing msg creator');
    }
    if (!to || !to.length) {
      throw new Error('missing msg destination');
    }
    if (!msgId || !msgId.length) {
      throw new Error('missing msgId');
    }
    if (!ts) {
      ts = Date.now();
    }

    // yield [store.zadd('im:dm:f:' + from, ts, msgId), store.zadd('im:dm:t:' + to, ts, msgId), store.hmset('im:m:' + msgId, {
    //   'msgId':msgId,
    //   'msg':msg,
    //   'type':'dm',
    //   'ts':ts,
    //   'from':from,
    //   'to':to
    // })];
    
    var conversationId = yield [store.hget('im:dmc:u:' + from, to), store.hget('im:dmc:u:' + to, from)];
    var cid;
    if (conversationId[0] && conversationId[1] && conversationId[0] === conversationId[1]) {
      cid = conversationId[0];
    } else {
      cid = uuid.v4();
      yield [store.hset('im:dmc:u:' + from, to, cid), store.hset('im:dmc:u:' + to, from, cid)];
    }

    yield [store.zadd('im:dm:c:' + cid, ts, msgId), store.hmset('im:m:' + msgId, {
      'msgId':msgId,
      'msg':msg,
      'type':'dm',
      'ts':ts,
      'from':from,
      'to':to
    })];

  },
  loadDMHistory: function *(me, targetUserId) {
    // By default, load last recent 10 chat history msgs
    if (!me || !me.length) {
      throw new Error('missing me');
    }
    if (!targetUserId || !targetUserId.length) {
      throw new Error('missing targetUserId');
    }
    var cid = yield store.hget('im:dmc:u:' + me, targetUserId);
    if (cid) {
      return yield store.zrevrangebyscore('im:dm:c:' + cid, '+inf', '-inf', 'limit', 0, 10);
    } else return [];
  },
  loadDMHistoryAdv: function *(me, targetUserId) {
    var entries = yield this.loadDMHistory(me, targetUserId);
    return yield populateMsgFromCache(entries);
  },
  loadRMHistory: function * (roomKey) {
    if (!roomKey || !roomKey.length) {
      throw new Error('missing roomKey');
    }
    return yield store.zrevrangebyscore('im:rm:r:' + roomKey, '+inf', '-inf', 'limit', 0, 10);
  },
  loadRMHistoryAdv: function * (roomKey) {
    var entries = yield this.loadRMHistory(roomKey);
    return yield populateMsgFromCache(entries);
  },
  pushActivity: function (evtType, evtData) {
    try {
      pub.publish('IMActivity', JSON.stringify({ 'evtType':evtType, 'payload':evtData }));  
    } catch (err) {
      console.error('pushActivity error', err);
    }
  },
  clearServerStats: function *() {
    var dynamicKeys = yield store.smembers('im:redisKeys');
    for (var i = 0; i < dynamicKeys.length; i++) {
      yield store.del(dynamicKeys[i]);
    }
    yield [ 
      store.del('im:users'),
      store.del('im:usernames'),
      store.del('im:serverstats'),
      store.del('im:redisKeys'),
      store.del('im:roomUserCount')
    ];
  }
}

// only dynamically created keys are added
var addRedisServerKey = function *(keys) {
  for (var i = 0; i < keys.length; i++) { 
    yield store.sadd('im:redisKeys', keys[i]);
  }
}

var populateUserFromCache = function *(entries) {
  var users = [];
  for (var i = 0; i < entries.length; i++) {
    var user = yield store.hgetall('im:up:' + entries[i]);
    if (user) {
      users.push(user);
    }
  }
  return users;
}

var populateMsgFromCache = function *(entries) {
  var msgs = [];
  for (var i = 0; i < entries.length; i++) {
    var msg = yield store.hgetall('im:m:' + entries[i]);
    if (msg) {
      msgs.push(msg);
    }
  }
  return msgs;
}


module.exports = imFn;
