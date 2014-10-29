'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatusSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  via: {
    type: String,
    default: 'web'
  },
  type: {
    type: String,
    required: true
  },
  summary: {
    type: String,
  },
  originalLink: String,
  isLeak: {
    type: Boolean,
    default: false
  },
  contentIds: [{
    type: Schema.ObjectId,
    ref: 'Content'
  }],
  sharedUsers: [String],
  sharedGroups: [String],
  hashtags: [String],
  allowComment: {
    type: Boolean,
    default: true
  },
  allowReshare: {
    type: Boolean,
    default: true
  }
})

StatusSchema.methods = {

}

var Status = mongoose.model('Status', StatusSchema);

var thunkify = require('thunkify');
Status.findOne = thunkify(Status.findOne);
Status.populate = thunkify(Status.populate);