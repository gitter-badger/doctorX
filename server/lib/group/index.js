'use strict';
var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

function load (app) {
  var groupRouter = new Router();
  
  groupRouter.get('/group/all', auth.authToken, middleware.getMyGroups);
  groupRouter.post('/group/create', auth.authToken, parser, middleware.createGroup);
  groupRouter.post('/group/rename', auth.authToken, parser, middleware.renameGroup);
  groupRouter.post('/group/delete', auth.authToken, parser, middleware.deleteGroup);

  groupRouter.get('/group/groupsOfFriend', auth.authToken, middleware.getGroupsOfFriend);
  groupRouter.post('/group/membersOfGroup', auth.authToken, parser, middleware.getMembersAdv);
  groupRouter.post('/group/addMembers', auth.authToken, parser, middleware.addMembers);
  groupRouter.post('/group/removeMembers', auth.authToken, parser, middleware.removeMembers);
  groupRouter.post('/group/moveMembers', auth.authToken, parser, middleware.moveMembers);

  app.use(groupRouter.middleware());
}

module.exports = load;