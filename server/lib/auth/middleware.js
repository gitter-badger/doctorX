/**
 * This is a koa middleware for 
 *  token authentication of API requests & thridparty oauth login
 *  
 * [authToken] Usage (only for Restful API protection)
 * Add this middleware into the middleware stack just before the one should be protected
 *
 * [oauthSuccess] Usage
 * middleware used when oauth succeed, render to a view in which userid should be store locally
 *
 */

exports.oauthSuccess = function * (next) {
  // console.log('oauth login ok');
  // console.log('this.req.user:', this.req.user);

  yield this.render('authSuccess', { userid:this.req.user.id });
}

exports.authToken = function * (next) {
  var userid = this.get('X-Access-Token'); //token === userid
  
  //check if user valid
  
  if (userid) {
    // console.log('Token authed!');
    this.req.me = userid;
    yield next;
  } else {
    console.log('fail@auth');
    this.status = 401;
    this.body = { 'status': 401, 'err':'unauth' };
  }
}