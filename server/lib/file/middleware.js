'use strict';
// var fileFn = require('./fn');
var config = require('../../config/appConfig.js');

var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = config.QINIU_ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.QINIU_SECRET_KEY;


var getUploadToken = function *(next) {
  try {

    var putPolicy = new qiniu.rs.PutPolicy(config.QINIU_PUBLICBUCKET_NAME);
    putPolicy.returnBody = '{\"key\": $(key), \"hash\": $(etag), \"w\": $(imageInfo.width), \"h\": $(imageInfo.height)}';
    
    var token = putPolicy.token();
    console.log('token issued:', token);
    this.body = { uptoken:token };
  } catch (err) {
    console.error('getUploadToken err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

var didUpload = function * (next) {
  var data = this.req.body;
  try {

    console.log('didUpload callback received post data:', data);
    this.body = { uptoken:token };
  } catch (err) {
    console.error('getUploadToken err', err);
    this.status = 500;
    this.body = { status:500, err:err.message };
  }
}

exports.getUploadToken = getUploadToken;
exports.didUpload = didUpload;

