var co = require('co');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doctorX');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {

  require('../lib/group/schema');
  var groupFn = require('../lib/group/fn');

  // co(groupFn.getMembers)(['testset1', 'testset2', 'testset3'], function(err, reply) {
  //   console.log('reply', reply);
  //   process.exit(0);
  // });

  // var group = {'owner': '53809fb667fbb529087296f3', 'displayTitle': '好友'};

  // co(function *() {
  //   var reply = yield groupFn.create(group);
  //   console.log('reply', reply);
  // })();

  // co(function * () {
  //   var reply = yield groupFn.addMembers(['53809fb667fbb529087296f3','53809fb667fbb529087296f0'], '539ed940b91b8fb10c417497');
  //   console.log('reply', reply);
  //   process.exit(0);
  // })();

  // co(function * () {
  //   var reply = yield groupFn.removeMembers(['53809fb667fbb529087296f3','53809fb667fbb529087296f0'], '539ed940b91b8fb10c417497');
  //   console.log('reply', reply);
  // })();

  co(function * () {
    var reply = yield groupFn.moveMembers(['53809fb667fbb529087296f0'], 
      '539ed940b91b8fb10c417497', '539ed90fd6551daf0c180222');
      console.log('reply', reply);
      process.exit(0);
  })();

})