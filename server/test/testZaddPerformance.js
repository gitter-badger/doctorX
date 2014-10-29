var redis = require('redis');

var client = redis.createClient();

client.select(3);
var start = new Date();
console.log('start:', start.getTime());
var finished = 0;
client = client.multi();
for (var i = 0; i < 100000; i++) {

  // client.zadd('testzset', 0, 'value-'+i, function(err, reply) {

  //   finished++;
  //   if (finished === 100000) {
  //     var stop = new Date();
  //     console.log('stop:', stop.getTime());
  //     console.log('last for:', (stop.getTime() - start.getTime()));
  //     process.exit(0);
  //   }
  // });
  
  client.zadd('testzset', 0, 'value-' + i);
}
client.exec(function(err, replies){
  var stop = new Date();
  console.log('stop:', stop.getTime());
  console.log('last for:', (stop.getTime() - start.getTime()));
  process.exit(0);
});


// client.select(3, function() {
//   // body...
//   var start = new Date();
//   console.log('start:', start.getTime());
//   var finished = 0;
//   for (var i = 0; i < 100000; i++) {

//     client.zadd('testzset', 0, 'value-'+i, function(err, reply) {

//       finished++;
//       if (finished === 100000) {
//         var stop = new Date();
//         console.log('stop:', stop.getTime());
//         console.log('last for:', (stop.getTime() - start.getTime()));
//         // process.exit(0);
//         // return;
//       }
//       return;
//     });
//   }
  
// })