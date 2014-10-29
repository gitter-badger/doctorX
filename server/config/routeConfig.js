var Router = require('koa-router');

function config(app) {
  dispatchViews(app);
}

function dispatchViews(app) {
  var index = require('../controllers/index');
  var pages = new Router();

  pages.get('/', index.index);
  pages.get('/app', index.app);
  
  app.use(pages.middleware());
}

module.exports = config;