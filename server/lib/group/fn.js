'use strict';

var redis = require('redis');
var store = redis.createClient();

var thunkify = require('thunkify');
// var uuid = require('node-uuid');

store.sunion = thunkify(store.sunion);
store.sinterstore = thunkify(store.sinterstore);
store.sdiffstore = thunkify(store.sdiffstore);
store.sadd = thunkify(store.sadd);
store.smembers = thunkify(store.smembers);
store.sismember = thunkify(store.sismember);
store.srem = thunkify(store.srem);
store.smove = thunkify(store.smove);

store.hget = thunkify(store.hget);
store.hmset = thunkify(store.hmset);
store.hgetall = thunkify(store.hgetall);
store.hincrby = thunkify(store.hincrby);


var mongoose = require('mongoose');
require('./schema');
var GroupMongo = mongoose.model('Group');

var userFn = require('../user/fn');

var groupFn = {
  'listMyGroups': function * (me) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    var cachedEntries = yield store.smembers('groups:u:' + me);
    if (cachedEntries && cachedEntries.length > 0) {
      return yield populateGroups(cachedEntries);
    } else return [];
  },
  'create': function * (group) {
    validateName(group.displayTitle);

    if (!group.owner || !group.owner.length) {
      throw new Error('missing owner for new group');
    }

    var titleDuplicate = yield duplicatedTitle(group.displayTitle, group.owner);
    if (titleDuplicate) {
      throw new Error('duplicate title');
    }
    
    var groupObj = new GroupMongo(group);
    groupObj.save = thunkify(groupObj.save);
    yield groupObj.save();

    try {
      // add new group to set of 'my-groups' in Redis
      yield store.sadd('groups:u:' + group.owner, groupObj._id);

      yield store.hmset('group:g:' + groupObj._id, 
        'id', groupObj._id, 
        'owner', groupObj.owner.toString(), 
        'displayTitle', groupObj.displayTitle,
        'visible', groupObj.visible, 
        'created', groupObj.created.getTime(),
        'count', 0);
    } catch (err) {
      console.error('create group to redis err', err);
    }
    return groupObj;
  },
  'rename': function * (groupId, displayTitle) {
    if (!groupId || !groupId.length) {
      throw new Error('missing groupId');
    }
    validateName(displayTitle);

    var groupObj = yield GroupMongo.findOne({_id:groupId});
    if (!groupObj) {
      throw new Error('group not exist');
    };

    var titleDuplicate = yield duplicatedTitle(displayTitle, groupObj.owner);
    if (titleDuplicate) {
      throw new Error('duplicate title');
    }

    groupObj.save = thunkify(groupObj.save);
    groupObj.displayTitle = displayTitle;
    yield groupObj.save();

    yield store.hmset('group:g:' + groupId, { displayTitle:displayTitle });
    return yield store.hgetall('group:g:' + groupId);
  },
  'delete': function *(me, groupId) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!groupId || !groupId.length) {
      throw new Error('missing groupId');
    }
    var groupExist = yield store.sismember('groups:u:' + me, groupId);
    if (groupExist == 0) {
      throw new Error('group not exist');
    }

    // TBD ------------------ clear the deleted group from friend's 'in group set'



    var redisReply = yield [store.del('members:g:' + groupId), store.del('group:g:' + groupId), store.srem('groups:u:' + me, groupId)];
    var groupObj = yield GroupMongo.findOne({ _id:groupId });
    groupObj.remove = thunkify(groupObj.remove);
    var mongoReply = yield groupObj.remove();

    return { cacheReply:redisReply, dbReply:mongoReply };
  },
  'getMembers': function * (groupIds) {
    if (groupIds && groupIds.length) {
      // console.log('groupIds', groupIds);

      for (var i = 0; i < groupIds.length; i++) {
        groupIds[i] = 'members:g:' + groupIds[i];
      }
      return yield store.sunion(groupIds);
    }
    return [];
  },
  'getMembersAdv': function *(groupIds) {
    var entries = yield this.getMembers(groupIds);
    return yield userFn.populateUsers(entries);
  },
  'addMembers': function * (me, userIds, groupId) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!groupId || !groupId.length) {
      throw new Error('missing groupId');
    }

    if (userIds && userIds.length) {
      var count = yield store.sadd('members:g:' + groupId, userIds);
      var reply = yield store.hincrby('group:g:' + groupId, 'count', count);
      
      // add group(s) to user(s)
      var multi = store.multi();
      for (var i = 0; i < userIds.length; i++) {
        multi.sadd('groups:u:' + me + ':f:' + userIds[i], groupId);
      }
      multi.exec();

      return reply;
    }

    return null;
  },

  'removeMembers': function * (me, userIds, groupId) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!groupId || !groupId.length) {
      throw new Error('missing groupId');
    }

    if (userIds && userIds.length) {
      var count = yield store.srem('members:g:' + groupId, userIds);
      var reply = yield store.hincrby('group:g:' + groupId, 'count', -count);

      // add group(s) to user(s)
      var multi = store.multi();
      for (var i = 0; i < userIds.length; i++) {
        multi.srem('groups:u:' + me + ':f:' + userIds[i], groupId);
      }
      multi.exec();


      return reply;
    }

    return null;
  },

  'quitFromAllGroups': function *(me, friendId) {
    var inGroups = yield this.getGroupsOfFriend(me, friendId);
    var opts = [];
    for (var i = 0; i < inGroups.length; i++) {
      opts[i] = this.removeMembers(me, [friendId], inGroups[i]);
    }
    if (opts.length) {
      return yield opts;
    }
  },

  'moveMembers': function * (me, userIds, srcGroupId, destGroupId) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }

    if (!srcGroupId) {
      return null;
    }
    if (!destGroupId) {
      return null;
    }

    if (userIds && userIds.length) {
      // var multiMove = store.multi();
      
      var srcSetKey = 'members:g:' + srcGroupId;
      var destSetKey = 'members:g:' + destGroupId;
      var srcHashKey = 'group:g:' + srcGroupId;
      var destHashKey = 'group:g:' + destGroupId;

      var reply;
      var multi = store.multi();

      for (var i = 0; i < userIds.length; i++) {
        reply = yield store.smove(srcSetKey, destSetKey, userIds[i]);
        console.log('reply', reply);
        if (reply === 1 || reply === '1') {
          yield store.hincrby(srcHashKey, 'count', -1);
          yield store.hincrby(destHashKey, 'count', 1);
        }

        multi.sadd('groups:u:' + me + ':f:' + userIds[i], destGroupId);
        multi.srem('groups:u:' + me + ':f:' + userIds[i], srcGroupId);

      }
      multi.exec();

      reply = yield [store.hget(srcHashKey, 'count'), store.hget(destHashKey, 'count')];

      return reply;
    }

    return null;
  },
  'getGroupsOfFriend': function *(me, friendId) {
    if (!me || !me.length) {
      throw new Error('missing user');
    }
    if (!friendId || !friendId.length) {
      throw new Error('missing friend');
    }
    // return yield store.smembers('groups:u:' + me + ':f:' + friendId);
    var key1 = 'groups:u:' + me + ':f:' + friendId;
    var key2 = 'groups:u:' + me;

    yield store.sinterstore(key1, key1, key2);
    return yield store.smembers(key1);
  },

  'getGroupsOfFriendAdv': function *(me, friendId) {
    var entries = yield this.getGroupsOfFriend(me, friendId);
    return yield populateGroups(entries);
  }

}

module.exports = groupFn;

var populateGroups = function *(entries) {
  if (entries && entries.length > 0) {
    for (var i = 0; i < entries.length; i++) {
      entries[i] = yield store.hgetall('group:g:' + entries[i]);
      // if (!entries[i]) {
        // for some unknown reason, the group does not exist,
        // then just clear the group from 'groups:u:userid' and 'groups:u:userid:f:friendid'
        // store.srem()
      // }
    }
    return entries;
  } else return [];
}

var validateName = function(name) {
  if (name && name.length) {
    // name = name.toLowerCase();
    // switch (name) {
    //   case '':
    // }
  } else {
    throw new Error('missing name');
  }
}

var duplicatedTitle = function * (title, userId) {
  var result = yield GroupMongo.findOne({owner:userId, displayTitle:title});
  if (result) {
    return true;
  } else return false;
}





