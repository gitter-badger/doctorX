// var echo = function *(str1, str2) {

//   // console.log('step 1');
//   yield str1;
//   // console.log('step 2');
//   yield str2;
//   // console.log('step 3');

//   // override next = function() {
//   //   return {'value': 'str1 is ' + str1, 'done': true};
//   // }

//   return '!';
// }

// var generatorOfecho = echo('hello', 'world');

// var ask = function *(str1, str2) {

//   yield str1;
//   yield str2;

//   return '?';
// }

// var generatorOfAsk = ask('hate', 'u');


// var res = [];
// var curr = null;
// // console.log('step 3-4');
// res.push((curr = generatorOfecho.next()).value);
// // console.log('step 4');
// res.push((curr = generatorOfecho.next()).value);
// // console.log('step 5');
// curr = generatorOfecho.next();
// // console.log('step 6');

// if (curr.done) {
//   console.log(res.join(' ') + curr.value);
// };


// var co = require('co');

// function add(x, y) {
//   return function(callback) {
//     callback(null, x + y);
//   };
// }

// co(function *() {
//   for (var i = 0; i < 10; i++) {
//     var value = yield add(i, i);

//     console.log(value);
//   }
// })();



// function *foo() {
//   var bar = yield 'foo';

//   console.log(bar);
// }

// var gen = foo();
// var curr = gen.next();
// console.log(curr.value);
// console.log('1');
// gen.next('daa', curr.value + 'bar');
// console.log('2');
// gen.next(curr.value + 'bar');
// //=> print 'foobar'



function echo(content) {
  return function(callback) {
    callback(null, content);
  };
}

function *exec(test) {
  var foo = yield echo(test);

  console.log(foo);
}
var gen = exec('this is test str');
var curr = gen.next(); // now curr.value is the Inner Function

curr.value(function(err, value) {
  if (err)
    return console.log(err);

  gen.next(value);
  //=> print 'bar'
});