/**
 * Initialize Login Router [local]
 * Router path List:
 *   - '/login': local username/password
 */

var Router = require('koa-router');
var parser = require('../common/bodyParser');
var middleware = require('./middleware');

function load (app) {
  var loginRouter = new Router();
  loginRouter.post('/register', parser, middleware.register);
  loginRouter.post('/registerWithIV', parser, middleware.registerWithInvitation);
  loginRouter.post('/login', parser, middleware.login);
  app.use(loginRouter.middleware());
}

module.exports = load;