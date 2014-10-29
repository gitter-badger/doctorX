'use strict';

var redis = require('redis');
var indexBase = redis.createClient();
var thunkify = require('thunkify');

var mongoose = require('mongoose');
// var ContentMongo = mongoose.model('Content');
var pinyin = require('pinyin');
var _ = require('underscore');

indexBase.zrangebylex = thunkify(indexBase.zrangebylex);
indexBase.smembers = thunkify(indexBase.smembers);

var searchFn = {
  'search': function * (q) {
    if (!q || !q.trim().length) {
      return [];
    }

    var han = getPinyin(q, 'FULL');
    var start = han.start;
    var stop = han.stop;

    console.log('starting searching from ', start, 'to', stop);

    if (stop === '+') {
      var result_terms = yield indexBase.zrangebylex('searchterms', '[' + start, '+', 'limit', 0, 10);  
    } else {
      var result_terms = yield indexBase.zrangebylex('searchterms', '[' + start, '(' + stop, 'limit', 0, 10);  
    }
    
    var result_JSONStr = [];
    for(var i in result_terms) {
      // console.log('retrieving term:', result_terms[i]);
      var entrylist = yield indexBase.smembers('term:' + result_terms[i]);
      // console.log(entrylist);
      result_JSONStr = result_JSONStr.concat(entrylist);
    }
    
    var uniqled = _.uniq(result_JSONStr);
    var finalResult = [];
    _.each(uniqled, function(item) {
      finalResult.push(JSON.parse(item));
    })

    return finalResult;
  },
  'searchByLimit': function * (q, limit) {
    if (!q || !q.trim().length) {
      return [];
    }

    var han = getPinyin(q, 'FULL');
    var start = han.start;
    var stop = han.stop;

    if (!limit) {
      limit = 10;
    }

    console.log('starting searching from ', start, 'to', stop);

    if (stop === '+') {
      var result_terms = yield indexBase.zrangebylex('searchterms', '[' + start, '+', 'limit', 0, limit);  
    } else {
      var result_terms = yield indexBase.zrangebylex('searchterms', '[' + start, '(' + stop, 'limit', 0, limit);  
    }
    
    var result_JSONStr = [];
    for(var i in result_terms) {
      // console.log('retrieving term:', result_terms[i]);
      var entrylist = yield indexBase.smembers('term:' + result_terms[i]);
      // console.log(entrylist);
      result_JSONStr = result_JSONStr.concat(entrylist);
    }
    
    var uniqled = _.uniq(result_JSONStr);
    var finalResult = [];
    _.each(uniqled, function(item) {
      finalResult.push(JSON.parse(item));
    })

    return finalResult;
  }
}



module.exports = searchFn;

var getPinyin = function(str, style) {
  
  var strConcat = '';
  var next = '';
  var nextConcat = '';
  if (style === 'FULL') {
    var full = pinyin(str, {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
        });

    console.log('start generating pinyin fully...');
    if (full.length == 1 && str.length > 1) {
      console.log('just length = 1', full);

      console.log('original q length', str.length);
      strConcat = full[0][0];
      
      var tail = _.last(strConcat);
      var header = strConcat.substring(0, strConcat.length - 1);
      console.log('strConcat', strConcat);
      console.log(tail);
      console.log(header);
      var newTail = require('./letterUtil').nextChar(tail.toLowerCase());
      if (newTail === '') {
        nextConcat = '+';
      } else {
        nextConcat = header + newTail;
      }
      return {'start': strConcat.toLowerCase(), 'stop': nextConcat.toLowerCase()};
    }

    for (var item in full) {
      strConcat += full[item];
      console.log(full[item]);
      next = full[item][0][0];
      console.log(next);
      if (item == full.length - 1) {
        var nextCh = require('./letterUtil').nextChar(next.toLowerCase());
        if (nextCh === '') {
          nextConcat = '+';
        } else {
          nextConcat += nextCh;  
        }
        
      } else {
        nextConcat = strConcat;
      }
    }
    console.log('end generating pinyin fully...');
    return {'start': strConcat.toLowerCase(), 'stop': nextConcat.toLowerCase()};

  } else if (style === 'FIRST') { // Style_First now just work stupid, so avoid using this style
    var first = pinyin(str, {
            style: pinyin.STYLE_FIRST_LETTER,
            heteronym: false
        });
    for (var item in first) {
      strConcat += first[item];
      next = full[item][0][0];
    }
    return {'start': strConcat.toLowerCase(), 'stop': next};

  } else 
      return null;
}