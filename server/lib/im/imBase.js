'use strict';

var co = require('co');
var redis = require('redis');
var sub = redis.createClient();
var store = redis.createClient();

sub.select('8');
sub.subscribe('IMActivity');

var imFn = require('./fn');

sub.on('subscribe', function(channel, message) {
  console.log('[IM Base storage listener] start to listening new IM activities @', channel, '...');
});

sub.on('message', function(channel, message) {
  // console.log(channel, message);

  try {
    var msgObj = JSON.parse(message);
    if (!msgObj || !msgObj.evtType) {
      return
    }

    if (channel === 'IMActivity') {
      switch (msgObj.evtType) {
        case 'report':
          onReport(msgObj.payload);
          break;
        case 'joinRoom':
          onJoinRoom(msgObj.payload);
          break;
        case 'leaveRoom':
          onLeaveRoom(msgObj.payload);
          break;
        case 'dm':
          onDm(msgObj.payload);
          break;
        case 'roomTalk':
          onRoomTalk(msgObj.payload);
          break;
        case 'disconnect':
          onDisconnect(msgObj.payload);
          break;

        default: console.log('default'); break;
      }
    }

  } catch(err) {
    console.error('IM Base storage listener error', err);
  }

});

var onReport = function(payload) {
  console.log('report payload', payload);
  co(imFn.land)(payload.userId, payload.userProfile, payload.ua);
}

var onLeaveRoom = function(payload) {
  console.log('leaveRoom payload', payload);
  co(function *(userId, roomKey) {
    yield [imFn.removeFromRoom(userId, roomKey), imFn.logLeaveRoom(userId, roomKey)];
  })(payload.userId, payload.room);
  // co(imFn.removeFromRoom)(payload.userId, payload.room);
}

var onJoinRoom = function(payload) {
  console.log('joinRoom payload', payload);
  co(function *(userId, roomKey) {
    yield [imFn.logJoinRoom(userId, roomKey), imFn.addToRoom(userId, roomKey)];
  })(payload.userId, payload.room);
}

var onDisconnect = function(payload) {
  console.log('disconnect payload', payload);
  co(imFn.disconnect)(payload.userId);
}

var onRoomTalk = function(payload) {
  console.log('roomTalk payload', payload);
  if (roomExist(payload.room)) {
    co(imFn.logRoomTalk)(payload.userId, payload.room, payload.msgId, payload.msg, payload.ts);
  }
}

var onDm = function(payload) {
  console.log('dm payload', payload);
  co(imFn.logDM)(payload.userId, payload.to, payload.msgId, payload.msg, payload.ts);
}

var roomExist = function(roomKey) {
  return true;
}