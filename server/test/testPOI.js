var co = require('co');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doctorX');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {

  require('../lib/content/schema');
  var poiFn = require('../lib/poi/fn');

  // co(function *() {
  //   var result = yield poiFn.getSubers(['53901ed7b36705ad07ddcbab', '53a145e93573f8c411872772']);
  //   console.log('result', result);
  //   process.exit(0);
  // })();

  // co(function *() {
  //   var result = yield poiFn.subscribe('53809fb667fbb529087296f3', ['53901ed7b36705ad07ddcbab', '53a145e93573f8c411872772']);
  //   console.log('result', result);
  //   process.exit(0);
  // })();

  // co(function *() {
  //   var result = yield poiFn.getPOIs('53809fb667fbb529087296f3');
  //   console.log('result', result);
  //   process.exit(0);
  // })()
  co(function *() {
    var result = yield poiFn.getPOIsAdv('53809fb667fbb529087296f3');
    console.log('result', result);
    process.exit(0);
  })()
  
})