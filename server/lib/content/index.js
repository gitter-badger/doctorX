'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

module.exports = function load(app) {
  var contentRouter = new Router();
  
  contentRouter.post('/content/create', auth.authToken, parser, middleware.create);
  
  contentRouter.get('/content/profile/:contentId', auth.authToken, middleware.getProfile);
  
  // pass 'verb' to the list some different set of contents 'verb' the very content
  contentRouter.get('/content/list/:contentId/:verb', auth.authToken, middleware.list);


  app.use(contentRouter.middleware());
}