'use strict';

var groupFn = require('./fn');

var getMyGroups = function *(next) {
  try {
    var reply = yield groupFn.listMyGroups(this.req.me);
    this.body = { status:200, result:reply };
  } catch (err) {
    console.error('getMyGroups error', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var createGroup = function *(next) {
  var data = this.req.body;
  data.owner = this.req.me;
  try {
    var reply = yield groupFn.create(data);
    this.body = { status:200, group:reply };
  } catch (err) {
    console.error('createGroup err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var renameGroup = function *(next) {
  var data = this.req.body;
  try {
    var reply = yield groupFn.rename(data.groupId, data.displayTitle);
    this.body = { status:200, group:reply };
  } catch (err) {
    console.error('renameGroup err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var deleteGroup = function *(next) {
  var data = this.req.body;
  try {
    var reply = yield groupFn.delete(this.req.me, data.groupId);
    // console.log('reply', reply);
    this.body = { status:200 };
  } catch (err) {
    console.error('deleteGroup err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var addMembers = function *(next) {
  var data = this.req.body;
  try {
    yield groupFn.addMembers(this.req.me, data.userIds, data.groupId);
    this.body = { status:200 };
  } catch (err) {
    console.error('addMembers err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var removeMembers = function *(next) {
  var data = this.req.body;
  try {
    yield groupFn.removeMembers(this.req.me, data.userIds, data.groupId);
    this.body = { status:200 };
  } catch (err) {
    console.error('removeMembers err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var moveMembers = function *(next) {
  var data = this.req.body;
  try {
    yield groupFn.moveMembers(this.req.me, data.userIds, data.srcGroupId, data.destGroupId);
    this.body = { status:200 };
  } catch (err) {
    console.error('moveMembers err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var getGroupsOfFriend = function *(next) {
  try {
    var groups = yield groupFn.getGroupsOfFriendAdv(this.req.me, this.query.friendId);
    this.body = { status:200, result:groups };
  } catch (err) {
    console.error('getGroupsOfFriend err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var getMembersAdv = function * (next) {
  var data = this.req.body;
  try {
    var members = yield groupFn.getMembersAdv(data.groupIds);
    this.body = { status:200, result:members };
  } catch (err) {
    console.error('getMembersAdv err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

exports.getMyGroups = getMyGroups;
exports.createGroup = createGroup;
exports.renameGroup = renameGroup;
exports.deleteGroup = deleteGroup;
exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.moveMembers = moveMembers;
exports.getGroupsOfFriend = getGroupsOfFriend;
exports.getMembersAdv = getMembersAdv;
// exports.quitFromAllGroups = quitFromAllGroups;