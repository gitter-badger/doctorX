var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doctorX');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('mongoDB connected!');
  
  require('../lib/status/schema');
  require('../lib/word/schema');

  var wordFn = require('../lib/word/fn');
  var mockWord = {
    author: '53809fb667fbb529087296f3',
    via: 'testcase',
    contentIds: ['538f1542cdc39331052e454f'],
    word: 'this is a test word',
    hashtags: ['test', 'grey', 'medicaldrama']
  };

  var mockPrivacy = {
    'sharedGroups': ['public']
  };

  var co = require('co');
  co(function *() {
    var reply = yield wordFn.write(mockWord, mockPrivacy);
    console.log('reply', reply);
    process.exit(0);
  })();

});