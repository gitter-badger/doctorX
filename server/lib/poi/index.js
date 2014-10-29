'use strict';

var auth = require('../auth/middleware');
var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

module.exports = function load(app) {
  var poiRouter = new Router();
  
  poiRouter.get('/poi/subscribed', auth.authToken, middleware.getPOIs);
  poiRouter.post('/poi/subscribe', auth.authToken, parser, middleware.subscribe);
  poiRouter.post('/poi/unsubscribe', auth.authToken, parser, middleware.unsubscribe);

  app.use(poiRouter.middleware());
}