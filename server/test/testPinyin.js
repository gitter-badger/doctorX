var pinyin = require('pinyin');

// han.letter('This is doctor x リーガルハイ 格蕾信用卡音乐aaaxx$@实习医生格蕾信用卡音乐', function(err, result) {
//   console.log('This is doctor x リーガルハイ 格蕾信用卡音乐aaaxx$@', result);
// });
// console.log(han.pinyin('实习医生格蕾信用卡音乐aaaxx$@'));
// console.log(han.pinyin('This is doctor x リーガルハイ 爱格蕾信用卡音乐aaaxx$@'));


console.log(pinyin("重庆"));    // [ [ 'zhōng' ], [ 'xīn' ] ]
console.log(pinyin("中心", {
  heteronym: true               // 启用多音字模式
}));                            // [ [ 'zhōng', 'zhòng' ], [ 'xīn' ] ]
console.log(pinyin("音乐", {
  // style: pinyin.STYLE_INITIALS, // 设置拼音风格
  heteronym: false
}));    
console.log(pinyin("重庆", {
  style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
  heteronym: false
}));        

console.log(pinyin("リーガルハイ信用卡fdsa", {
  style: pinyin.STYLE_FIRST_LETTER,
  heteronym: false
}));
console.log(pinyin("リーガルハイ信用卡fdsa", {
  style: pinyin.STYLE_NORMAL,
  heteronym: false
}));