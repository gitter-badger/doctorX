var co = require('co');

var fn = require('../lib/friend/fn');

co(function *(){
  // var reply = yield fn.listMyIVcodes('53809fb667fbb529087296f3');
  
  // var reply = yield fn.addQuota('53809fb667fbb529087296f3', 10);

  // var reply = yield fn.redeemIVcode('d03b9d80-066c-11e4-8c42-7b0983ff6595', '53809fb667fbb529087296f3');
  // var reply = yield fn.follow('5381817e67fbb529087296f4', '53809fb667fbb529087296f3');

  var reply = yield fn.findFriendByGRcode('99d212b0-0671-11e4-aca9-999c402e7c2d');
  console.log('reply:', reply);
  process.exit(0);
})();