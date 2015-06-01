'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
var middleware = require('./middleware');

var esCustomDic = require('./esCustomDic');

module.exports = function load(app) {
  var searchRouter = new Router();  
  searchRouter.get('/search', auth.authToken, middleware.search);

  searchRouter.head('/esCustomDic', esCustomDic.handleHeadCustomDic);
  searchRouter.get('/esCustomDic', esCustomDic.handleGetCustomDic);

  app.use(searchRouter.middleware());
}
