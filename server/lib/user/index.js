
var Router = require('koa-router');
// var parser = require('../common/bodyParser');
var middleware = require('./middleware');
var auth = require('../auth/middleware');

var load = function (app) {
  var userRouter = new Router();
  userRouter.get('/user', auth.authToken, middleware.getUser);

  app.use(userRouter.middleware());
}

module.exports = load;