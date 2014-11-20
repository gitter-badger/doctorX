'use strict';
// var fileFn = require('./fn');

var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = 'ALQ_Rw_Fo0PENFQr9R0vIk0GNWMOIxcTNjhnZnoZ';
qiniu.conf.SECRET_KEY = 'ZmlEBJYDrDNfgzxZbLIwgCbtwsZLt1gbTw-kMf76';
// qiniu.conf.returnBody = '{\"key\": $(key), \"hash\": $(etag), \"w\": $(imageInfo.width), \"h\": $(imageInfo.height)}';

var getUploadToken = function *(next) {
  try {

    var putPolicy = new qiniu.rs.PutPolicy('doctorx-public');
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


