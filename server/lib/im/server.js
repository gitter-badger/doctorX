var config = require('../../config/appConfig.js');

var uuid = require('node-uuid');

var redis = require('redis');
// var store = redis.createClient();
// var pub = redis.createClient();
var subPersonal = redis.createClient();
var subPublic = redis.createClient();

// publish to channel named "activity" 
var pub = redis.createClient();
pub.select(8);

subPersonal.select(8);
subPublic.select(8);

var imFn = require('./fn');

var co = require('co');

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

co(imFn.clearServerStats)();


// users' personal message channel
subPersonal.subscribe('personal');
// public channel for content, tag, user-group etc.
subPublic.subscribe('public');

var io = require('socket.io')();

var allClients = [];  //key: userid, value: client socket object
var allUserId = []; //key: socketid, value: userid

var personalLisenter = function(channel, message){
  try {
    console.log('message', message);
    var msgObj = JSON.parse(message);
    console.log('message', msgObj);
    liveMsgFn.sendDMToUser(msgObj.to, msgObj);
  } catch (err) {
    console.error('personalLisenter error:', err);
  }
};

var publicListener = function(channel, message) {
  try {
    console.log('message', message);
    var msgObj = JSON.parse(message);
    var rooms = msgObj.contentIds;
    for (var i = 0; i < rooms.length; i++) {
      liveMsgFn.broadcastToRoom(rooms[i], 'word', msgObj.owner, msgObj);
    }
  } catch (err) {
    console.error('publicListener error', err);
  }
};

// by default, every user sub to his/her own 'virtual channel'
subPersonal.on('message', personalLisenter);
subPublic.on('message', publicListener);

var socketConnHandler = function(client) {
  console.log('before connect client count', Object.size(allClients));

  var disconnectHandler = function(arg) {
    try {
      console.log('disconnect', arg);
      console.log('before client count', Object.size(allClients));
      var clientid = client.id;
      var userId = allUserId[clientid];

      if (!userId) {
        console.warn('You are trying to disconnect an nonexistent socket client');
        return
      }

      // 0. if already joined some rooms, leave first

      co(function *(userId){
        var rooms = yield imFn.listJoinedRooms(userId);
        for (var i = 0; i < rooms.length; i++) {
          leaveRoom(rooms[i], userId, null, 'disconnect');
        }
      })(userId);

      // 1. nofity friends 'I am leaving'
      co(function *(clients) {
        var target = yield imFn.listOnlineFriends(userId);
        var userProfile = yield imFn.getUPCache(userId);
        for (var i = 0; i < target.length; i++) {
          if (clients[target[i]]) {
            clients[target[i]].emit('friendOff', {
              payload:userProfile,
              'ts':Date.now()
            });
          }
        }
      })(allClients);

      // 2. push to Redis channel 'Activity' for persistence
      imFn.pushActivity('disconnect', {
        'userId':userId
      });

      if (allClients[userId]) {
        delete allClients[userId];  
      }
      
      if (allUserId[clientid]) {
        delete allUserId[clientid];
      }
      
      console.log('after client count', Object.size(allClients));

    } catch (err) {
      console.error('disconnectHandler error', err);
    }
  };

  var reportHandler = function(evtData) {
    evtData.ts = Date.now();
    var userId = evtData.userId;
    var userProfile = evtData.userProfile;
    
    // already connected before and for some reason not been cleared, just get it force cleaned
    if (allClients[userId]) {
      console.log('disconnecting expired or duplicated client...');
      allClients[userId].disconnect();
    };

    allUserId[client.id] = userId;
    allClients[userId] = client;
    console.log('after connect client count', Object.size(allClients));

    // 1. nofity friends 'I am landing'
    // --------------------------- if: state == 'online'
    // --------------------------- then: nofity friends 'someone on' (online & mutual following friends)
    if (evtData.state && evtData.state === 'online') {
      co(function *(clients) {
        var target = yield imFn.listOnlineFriends(userId);
        for (var i = 0; i < target.length; i++) {
          if (clients[target[i]]) {
            clients[target[i]].emit('friendOn', {
              payload:userProfile,
              ua:evtData.ua,
              'ts':evtData.ts 
            });
          } 
        }
      })(allClients);
    }

    // 2. push to Redis channel 'Activity' for persistence
    imFn.pushActivity('report', {
      'userId':userId,
      'userProfile':userProfile,
      'ua':evtData.ua,
      'state':evtData.state
    });

    // 3. start listening to room related events & direct messages
    startListenRoomEvent(userId);
    startListenDM(userId);
  };
  
  client.on('report', reportHandler);
  client.on('disconnect', disconnectHandler);


}

io.on('connection', socketConnHandler);
io.listen(config.IM_PORT);




//
//
//
//
//
//
// listen event from client-side
// room
var startListenRoomEvent = function(userId) {
  var joinRoomEventHandler = function (evtData) {
    evtData.ts = Date.now();
    var roomKey = evtData.room;
    console.log('joinRoom event fired:', evtData, 'clientid:', allClients[userId].id);
    // client.emit('rejectJoin', { msg:'not permit!', roomKey:data.room });
    allClients[userId].join('room:' + roomKey);
    imFn.pushActivity('joinRoom', {
      'userId':userId,
      'room':roomKey,
      'ua':evtData.ua
    });

    // nofity users in room that 'I am in.'
    liveMsgFn.broadcastToRoom(roomKey, 'join', userId, evtData);
  }

  var roomTalkEventHandler = function (evtData) {
    evtData.ts = Date.now();
    console.log('got msg:', evtData.msg, 'from room:', evtData.room);
    var msgId = uuid.v4();
    imFn.pushActivity('roomTalk', {
      'userId':userId,
      'msgId':msgId,
      'msg':evtData.msg,
      'room':evtData.room,
      'ua':evtData.ua,
      'ts':evtData.ts
    });
    evtData.msgId = msgId;
    liveMsgFn.broadcastToRoom(evtData.room, 'talk', userId, evtData);
  }

  var leaveRoomEventHandler = function (evtData) {
    evtData.ts = Date.now();
    var roomKey = evtData.room;
    console.log('leaveRoom event fired:', evtData, 'clientid:', allClients[userId].id);
    leaveRoom(roomKey, userId, evtData.ua, evtData);
  }

  allClients[userId].on('joinRoom', joinRoomEventHandler);
  allClients[userId].on('roomTalk', roomTalkEventHandler);
  allClients[userId].on('leaveRoom', leaveRoomEventHandler);
};

//
// Listen to
// private whisper
var startListenDM = function(userId) {
  function DMEventHandler(evtData) {
    evtData.ts = Date.now();

    if (allClients[evtData.to]) {
      console.log('dm event fired:', evtData);
      var msgId = uuid.v4();
      imFn.pushActivity('dm', {
        'userId':userId,
        'msgId':msgId,
        'msg':evtData.msg,
        'to':evtData.to,
        'ua':evtData.ua,
        'ts':evtData.ts
      });
      evtData.msgId = msgId;
      liveMsgFn.sendDMToUser(userId, evtData);
    } else {
      // allClients[userId].emit('dm', )
    }

  }

  allClients[userId].on('dm', DMEventHandler);
};

// Just for non-persistent msg delivery
var liveMsgFn = {
  'broadcastToRoom': function(roomKey, type, userId, payload) {
    if (!type || !type.length) {
      return
    }
    if (!payload.ts) {
      payload.ts = Date.now();
    }

    // -------TODO-----filter msg here
    // if (false) {
    //   return
    // }
    io.sockets.in('room:' + roomKey).emit('roomActivity', {
      'payload':payload,
      'userId':userId,
      'type':type,
      'ts':payload.ts
    });
    
  },
  'sendDMToUser':function(userId, msg) {
    if (allClients[msg.to]) {
      allClients[msg.to].emit('dm', {
        'from': userId,
        'payload':msg,
        'ts':msg.ts
      });
    }
  }
}

var leaveRoom = function(roomKey, userId, ua, evtData) {
  try {
    if (allClients[userId]) {
      allClients[userId].leave('room:' + roomKey);
    }
    imFn.pushActivity('leaveRoom', {
      'userId':userId,
      'room':roomKey,
      'ua':ua
    });
    liveMsgFn.broadcastToRoom(roomKey, 'leave', userId, evtData);  
  } catch (err) {
    console.error('leaveRoom error', err);
  }
}