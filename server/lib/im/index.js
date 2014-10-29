'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
// var parser = require('../common/bodyParser');
var middleware = require('./middleware');

module.exports = function load(app) {
  var imRouter = new Router();
  
  imRouter.get('/online/friends', auth.authToken, middleware.getOnlineFriends);
  imRouter.get('/online/roominfo', auth.authToken, middleware.getRoominfo);
  imRouter.get('/online/whoinroom', auth.authToken, middleware.getUsersInRoom);
  imRouter.get('/online/dmhistory', auth.authToken, middleware.retrieveDMHistory);
  imRouter.get('/online/rmhistory', auth.authToken, middleware.retrieveRMHistory);
  
  // imRouter.post('/poi/subscribe', auth.authToken, parser, middleware.subscribe);

  app.use(imRouter.middleware());
}