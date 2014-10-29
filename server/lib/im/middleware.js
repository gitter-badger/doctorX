'use strict';

var imFn = require('./fn');

exports.getOnlineFriends = function *(next) {

  try {
    var onlineFriends = yield imFn.listOnlineFriendsAdv(this.req.me);
    this.body = { 'status':200, 'result':onlineFriends };
  } catch(err) {
    console.error('getOnlineFriends error', err);
    this.body = { 'status':500, 'err':err.message };
  }
}

exports.getUsersInRoom = function *(next) {
  try {
    var users = yield imFn.listUsersInRoomAdv(this.req.query.roomKey);
    this.body = { 'status':200, 'result':users };
  } catch(err) {
    console.error('getUsersInRoom error', err);
    this.body = { 'status':500, 'err':err.message };
  }
}

exports.getRoominfo = function *(next) {
  try {

  } catch(err) {
    console.error('getRoominfo error', err);
  }
}

exports.retrieveDMHistory = function *(next) {
  try {
    var msgs = yield imFn.loadDMHistoryAdv(this.req.me, this.req.query.targetUserId);
    this.body = { 'status':200, 'result':msgs };
  } catch(err) {
    console.error('retrieveDMHistory error', err);
    this.body = { 'status':500, 'err':err.message };
  }
}

exports.retrieveRMHistory = function *(next) {
  try {
    var msgs = yield imFn.loadRMHistoryAdv(this.req.query.roomKey);
    this.body = { 'status':200, 'result':msgs };
  } catch(err) {
    console.error('retrieveRMHistory error', err);
    this.body = { 'status':500, 'err':err.message };
  }
}