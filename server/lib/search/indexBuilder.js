var redis = require('redis');
var sub = redis.createClient();
var store = redis.createClient();
var pinyin = require('pinyin');

sub.subscribe('content-channel');
sub.on('subscribe', function(channel, message) {
  console.log('search index Builder start to listening new content creation @', channel, '...');
});

sub.on('message', function(channel, message) {
  console.log('channel, message', channel, message);

  var content = JSON.parse(message);
  var contentCard = {};
  contentCard.id = content._id;
  contentCard.displayTitle = content.displayTitle;
  contentCard.description = content.description;
  contentCard.coverImg = content.coverImg;

  putTerm(getPinyin(content.displayTitle, 'FULL'), contentCard);
  putTerm(getPinyin(content.displayTitle, 'FIRST'), contentCard);


  if (content.nativeTitle && content.nativeTitle != '') {
    putTerm(getPinyin(content.nativeTitle, 'FULL'), contentCard);
    putTerm(getPinyin(content.nativeTitle, 'FIRST'), contentCard);
  }

  if (content.alias && content.alias.length) {
    for (var item in content.alias) {
      putTerm(getPinyin(item, 'FULL'), contentCard);
      putTerm(getPinyin(item, 'FIRST'), contentCard);
    };
  }

});

// han.letter('This is doctor x リーガルハイ 格蕾信用卡音乐aaaxx$@实习医生格蕾信用卡音乐', function(err, result) {
//   console.log('This is doctor x リーガルハイ 格蕾信用卡音乐aaaxx$@', result);
// });
// console.log(han.pinyin('实习医生格蕾信用卡音乐aaaxx$@'));
// console.log(han.pinyin('This is doctor x リーガルハイ 爱格蕾信用卡音乐aaaxx$@'));

var putTerm = function(term, contentCard, cb) {
  store.zadd('searchterms', 0, term, function(err, reply) {
    if (err) {
      console.error(err);
    } else {
      console.log('added search term:', term, 'with result:', reply);
      if (cb) {
        cb(reply);
      }
      putTermSet(term, contentCard);
    }
  })
}


// [contentCard]
// entry of search result for search target type: 'content'
//
var putTermSet = function(term, contentCard, cb) {
  console.log('contentid', contentCard.id);
  store.sadd('term:' + term, JSON.stringify(contentCard), function(err, reply) {
    if (err) {
      console.error(err);
    } else {
      console.log('indexed content:', contentCard.displayTitle, 'to termset of term:', term);
      if (cb) {
        cb(reply);
      }
    }
  })
}

var getPinyin = function(str, style) {
  var strConcat = '';
  if (style === 'FULL') {
    var full = pinyin(str, {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
        });
    for (var item in full) {
      strConcat += full[item];
    }
    return strConcat.toLowerCase();
  } else if (style === 'FIRST') {
    var first = pinyin(str, {
            style: pinyin.STYLE_FIRST_LETTER,
            heteronym: false
        });
    for (var item in first) {
      strConcat += first[item];
    }
    return strConcat.toLowerCase();
  } else 
      return null;
}


