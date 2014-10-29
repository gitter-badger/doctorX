var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doctorX');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('mongoDB connected!');
  
  require('../lib/status/schema');
  require('../lib/user/schema');
  require('../lib/content/schema');

  // var StatusMongo = mongoose.model('Status');
  var statusFn = require('../lib/status/fn');

  var testData = {};
  testData.summary = 'test status summary---notype';
  testData.via = 'directTestCall';
  testData.type = 'review';
  // testData.sharedGroups = ['testset1', 'testset2', 'testset3'];
  testData.sharedGroups = ['public'];
  // testData.sharedGroups = ['onlyme'];
  // testData.sharedGroups = ['friends'];
  // testData.sharedUsers = ['u1', 'u2', 'u3'];
  // testData.sharedUsers = ['onlyme'];
  testData.owner = '53809fb667fbb529087296f3';
  testData.contentIds = ['53901ed7b36705ad07ddcbab'];

  var co = require('co');
  // co(statusFn.createStatus)(testData, function(err, data) {
  //   console.log('coreturn', data);
  //   process.exit(0);
  // });

  // testData.summary = 'test status summary---review';
  // co(statusFn.createReviewStatus)(testData);

  // testData.summary = 'test status summary---short';
  // co(statusFn.createShortStatus)(testData);  


  co(function *(){
    var result = yield statusFn.getMyFollowingStreamAdv('53809fb667fbb529087296f3', '', 10);
    console.log('result:', result.length, '\n', result);
    // console.log(result[0].owner);
    // console.log(result[0].contentIds);
    process.exit(0);
  })();

  // co(function *(){
  //   var result = yield statusFn.getMySubscribeStream('53809fb667fbb529087296f3', '539dc04293cbe7c70665f1d5', 500);
  //   console.log('result:', result.length, '\n', result);
  //   process.exit(0);
  // })();

  // co(function *(){
  //   var result = yield statusFn.getStreamByContent('538f1542cdc39331052e454f', 'word', '', 500);
  //   console.log('result:', result.length, '\n', result);
  //   process.exit(0);
  // })();


});




