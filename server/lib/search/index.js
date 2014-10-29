'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
var middleware = require('./middleware');

module.exports = function load(app) {
  var searchRouter = new Router();  
  searchRouter.get('/search', auth.authToken, middleware.search);
  app.use(searchRouter.middleware());
}