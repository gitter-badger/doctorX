var Router = require('koa-router');
var auth = require('../middlewares/auth');
var apis = require('../apis/demoAPI');

function dispatchAPIs(app) {
  var apiRouter = new Router();
  apiRouter.all('/test', auth.authToken, apis.demo);

  app.use(apiRouter.middleware());
}

function config(app) {
  dispatchAPIs(app);
}

module.exports = config;