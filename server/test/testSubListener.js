var redis = require('redis');

var sub = redis.createClient();

sub.subscribe('content-channel');
sub.on('message', function(channel, message) {
  console.log('channel, message', channel, message);
  console.log(JSON.parse(message)['nativeTitle']);
});