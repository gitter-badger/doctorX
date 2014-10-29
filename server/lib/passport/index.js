/**
 * Initialize Login/Register Router and set Passport as auth service provider
 * Router path List:
 *   - '/login': local username/password
 *   - '/register': receive submitted register form
 *   - '/auth/weibo': redirect to weibo oauth
 *   - '/auth/weibo/callback': weibo oauth login or register callback
 *   - '/auth/facebook': redirect to facebook oauth
 *   - '/auth/facebook/callback': facebook oauth login or register callback
 *   - '/auth/twitter': redirect to twitter oauth
 *   - '/auth/twitter/callback': twitter oauth login or register callback
 *   - '/auth/douban': redirect to douban oauth
 *   - '/auth/douban/callback': douban oauth login or register callback
 */

var Router = require('koa-router');
var passport = require('koa-passport');
require('./passport');
var auth = require('../auth/middleware');


function load (app) {
  app.use(passport.initialize());
  // app.use(passport.session());

  var authRouter = new Router();

  // authRouter.post('/register', function *(next) {
  //   console.log('register');
  //   yield next;
  // });

  // authRouter.get('/toLogin', function * (next) {
  //   yield this.render('tologin');
  // });

  // authRouter.post('/login', bodiedReq, login.localLogin
    // passport.authenticate('local', { 
    //   session: false}

    // ),
    // function * (next) {
    //   console.log('login ok');
    //   console.log('this.req.body:', this.req.body);
    //   console.log('this.req.user:', this.req.user);
    //   console.log('this.res.user:', this.res.user);
    //   console.log('http status:', this.res.statusCode);
    //   // this.redirect('/');
    //   this.body = {msg:'ok'};
    // }

    // function * (next) {
    //   var ctx = this;
    //   var middleware = yield passport.authenticate('local', { session: false },
    //     function(err, user, info) {
    //       console.log('err:', err);
    //       console.log('user:', user);
    //       console.log('info:', info);
    //       if (!user) {
    //         // this.body = 'error';
    //         console.log('!user');
    //         console.log('ctx.redirect:', (ctx.redirect));
    //         ctx.redirect('/toLogin');

    //       } else {
    //         // return ctx.body = {'user':user ,'info':info};
    //         ctx.redirect('/');
    //       }
    //     }
    //   );
    //   middleware(next);
    // }

    // function * (next) {
    //   yield passport.authenticate('local',
    //     function (err, user, info) {
    //       console.log('err:', err);
    //       console.log('user:', user);
    //       console.log('info:', info);
    //     }
    //   );
      
    // }
    // TODO: refactor with a handler instead of redirect
    //        to be able to res.json(token)
  // );

  // authRouter.get('/logout', function * (next) {
  //     // this.session = null;
  //     // this.req.session = null;
  //     // this.req.user = null;
  //     this.req.logout();
  //     this.redirect('/toLogin');
  //   }
  // );

  authRouter.get('/auth/weibo', passport.authenticate('weibo'));
  authRouter.get('/auth/weibo/callback',
    passport.authenticate('weibo', {
      successRedirect: '/',
      failureRedirect: '/toLogin'
    })
  );

  authRouter.get('/auth/facebook', passport.authenticate('facebook'));
  authRouter.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/toLogin'
    })
  );

  authRouter.get('/auth/twitter', passport.authenticate('twitter'));
  authRouter.get('/auth/twitter/callback', 
    passport.authenticate('twitter', { session:false }),
    auth.oauthSuccess
  );
  authRouter.get('/auth/douban', passport.authenticate('douban'));
  authRouter.get('/auth/douban/callback', 
    passport.authenticate('douban', { session:false }),
    auth.oauthSuccess
  );

  app.use(authRouter.middleware());
}

module.exports = load;