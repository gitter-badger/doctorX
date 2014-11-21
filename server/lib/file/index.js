'use strict';
var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

function load (app) {
  var fileRouter = new Router();
  
  fileRouter.get('/file/uploadToken', auth.authToken, middleware.getUploadToken);

  fileRouter.post('/file/didUpload', auth.authToken, parser, middleware.didUpload);


  // fileRouter.get('/file/findPeopleByGRcode', auth.authToken, middleware.findFriendByGRcode);
  // fileRouter.post('/file/follow', auth.authToken, parser, middleware.follow);

  app.use(fileRouter.middleware());
}

module.exports = load;