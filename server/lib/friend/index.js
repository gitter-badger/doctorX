'use strict';
var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

function load (app) {
  var friendRouter = new Router();
  
  friendRouter.get('/friend/validateIVcode', middleware.validateIVcode);
  friendRouter.get('/friend/findPeopleByGRcode', auth.authToken, middleware.findFriendByGRcode);
  friendRouter.post('/friend/follow', auth.authToken, parser, middleware.follow);
  friendRouter.post('/friend/followWithGRcode', auth.authToken, parser, middleware.followWithGRcode);
  friendRouter.post('/friend/unfollow', auth.authToken, parser, middleware.unfollow);
  friendRouter.get('/friend/genIVcode', auth.authToken, middleware.genIVcode);
  friendRouter.get('/friend/checkAlreadyFollowed', auth.authToken, middleware.alreadyFollowed);
  friendRouter.get('/friend/genGRcode', auth.authToken, middleware.genGRcode);
  friendRouter.get('/friend/getIVQuota', auth.authToken, middleware.getIVQuota);
  friendRouter.get('/friend/followings', auth.authToken, middleware.allFollowings);
  friendRouter.get('/friend/followers', auth.authToken, middleware.allFollowers);

  app.use(friendRouter.middleware());
}

module.exports = load;