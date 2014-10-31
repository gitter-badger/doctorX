'use strict';

var module = angular.module('sio', ['btford.socket-io']);

module.factory('mySocket', function(socketFactory, $http, userService, _) {

  var defaultUA = { 'via':'tumkrSite' };

  var _joinedRooms = [];

  console.log('connect socketio');
  // var myIoSocket = io.connect('/news');

  // mySocket = socketFactory({
  //   ioSocket: myIoSocket
  // });
 
  var mySocket;
  
  try {
    mySocket = socketFactory();

  } catch(err) {
    console.warn('socket initialization failed', err);
    mySocket = null;
    return
  }

  mySocket.forward('sysNotify');
  
  mySocket.on('disconnect', function(evt, data) {
    console.log('socket disconnect', evt, data);
    
    // todo: notify user there is something unexpected happened to the connection

  });  

  mySocket.report = function(userProfile) {
    // mock state to 'online' for dev
    mySocket.emit('report', { 'userId':userService.getUserLocal(), 'userProfile':userProfile, 'ua':defaultUA, 'state':'online' });


    // --------TODO 
    // --------if provide 'reconnect'(report without refresh web page)
    // --------client socket cache should be cleared

  }


  // this should be only invoked once during page lifecycle
  mySocket.initSession = function() {
    mySocket.forward('friendOn');
    mySocket.forward('friendOff');
    mySocket.forward('dm');
    mySocket.forward('roomActivity');
  }

  mySocket.joinRoom = function(roomKey) {
    console.log('_joinedRooms', _joinedRooms);
    console.log('request join room:', roomKey);
    

    if (_.contains(_joinedRooms, roomKey)) {
      console.warn('already joined room:', roomKey);
      return
    }

    mySocket.emit('joinRoom', { 'room':roomKey, 'ua':defaultUA });

    // mySocket.forward('roomActivity');


    _joinedRooms.push(roomKey);
  };

  mySocket.leaveRoom = function(roomKey) {
    mySocket.emit('leaveRoom', { 'room':roomKey, 'ua':defaultUA });

    var i = _joinedRooms.indexOf(roomKey);
    if(i != -1) {
      _joinedRooms.splice(i, 1);
    }
  }

  mySocket.sendRM = function(roomKey, say) {
    mySocket.emit('roomTalk', { 'room':roomKey, 'msg':say, 'ua':defaultUA });
  };

  mySocket.sendDM = function(to, say) {
    mySocket.emit('dm', { 'to':to, 'msg':say, 'ua':defaultUA });
  };

  mySocket.createPrivateRoom = function(secret) {

  }

  mySocket.getJoinedRooms = function() {
    return _joinedRooms;
  }



  return mySocket;

});