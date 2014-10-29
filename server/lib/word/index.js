'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

module.exports = function load(app) {
  var wordRouter = new Router();
  
  wordRouter.post('/word/write', auth.authToken, parser, middleware.write);

  app.use(wordRouter.middleware());
}