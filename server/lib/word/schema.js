'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WordSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  via: {
    type: String,
    default: 'web'
  },
  word: {
    type: String,
  },
  contentIds: [{
    type: Schema.ObjectId,
    ref: 'Content'
  }],
  exLink: String,
  images: [String],
  voices: [String],
  videos: [String],
  hashtags: [String]
})

WordSchema.methods = {

}

var Word = mongoose.model('Word', WordSchema);

var thunkify = require('thunkify');
Word.findOne = thunkify(Word.findOne);