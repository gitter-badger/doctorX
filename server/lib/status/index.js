var auth = require('../auth/middleware');
var Router = require('koa-router');
// var parser = require('../common/bodyParser');
var middleware = require('./middleware');

module.exports = function load(app) {
  var statusRouter = new Router();

  statusRouter.get('/feed/following', auth.authToken, middleware.getFollowingFeedsAdv);
  statusRouter.get('/feed/subscribing', auth.authToken, middleware.getSubscribingFeedsAdv);
  // statusRouter.get('/')
  app.use(statusRouter.middleware());
}

