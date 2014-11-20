var koa = require('koa');
// var logger = require('koa-logger');
var views = require('koa-views');
var staticServer = require('koa-static');
// var bodyParser = require('co-body');
var session = require('koa-session');
var config = require('./server/config/appConfig.js');
var app = koa();
// app.use(logger());

app.keys = [config.SECRET];
app.use(session());
app.use(staticServer(__dirname + '/client'));
// app.use(views('./server/views', 'jade', {}));

app.use(views('./server/views', {
  default: 'jade'
}));

require('./server/config/dbConfig')(app);

require('./server/lib/user')(app);
require('./server/lib/login')(app);
require('./server/lib/passport')(app);

require('./server/lib/file')(app);
require('./server/lib/content')(app);
require('./server/lib/search')(app);
require('./server/lib/word')(app);
require('./server/lib/status')(app);
require('./server/lib/poi')(app);
require('./server/lib/friend')(app);
require('./server/lib/group')(app);
require('./server/lib/im')(app);

// require('./server/lib/post')(app);
// require('./server/lib/content')(app);
// require('./server/lib/channel')(app);
// require('./server/lib/tag')(app);
// require('./server/lib/file')(app);

// Require authentication for now
// app.use(function*(next) {
//   if (this.req.isAuthenticated()) {
//     yield next;
//   } else {
//     // console.log(this.session);
//     this.redirect('/toLogin');
//   }
// });

// app.use(function * (next) {
//   var token = this.get('X-Access-Token');
//   console.log('token:', token);
//   yield next;
// });

// require('./server/config/routeConfig')(app);
// require('./server/config/apiConfig')(app);

app.use(function *(next){
  try {

    if (this.status === 404) {
      this.status = 404;
      yield this.render('404');
    }

    yield next;

    

  } catch (err) {
    console.error('err', err.status);
    this.body = { status:err.status, msg:err.message };
  }
});

app.on('error', function(err){
  console.error('server error ', err);
});


// pure web app backend server, not including messaging service(socket.io)
app.listen(config.DEFAULT_PORT);

// web app backend server combine with messaging service(socket.io)
// var server = require('./server/config/socketio')(app);
// server.listen(config.DEFAULT_PORT);






