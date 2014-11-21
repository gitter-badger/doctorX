// Currently only config for mongoDB
// Will be refactorred for Redis configuration

module.exports = function(app) {
  var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/doctorX');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log('mongoDB connected!');
    
  });
  db.on('connection', function(){
    console.log('connection established');
  });
  registerSchema();
}

var registerSchema = function() {
  require('../lib/user/schema');
  require('../lib/content/schema');
  require('../lib/status/schema');
  require('../lib/group/schema');
  require('../lib/word/schema');
}