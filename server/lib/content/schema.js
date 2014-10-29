'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  by: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  via: {
    type: String,
    default: 'web'
  },
  displayTitle: {
    type: String,
    trim: true,
    required: true
  },
  nativeTitle: {
    type: String,
    trim: true,
  },
  alias: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: true
  },
  progress: {
    type: String,
    default: 'TBA'//'TBA': to be announced, 'RIP': been shut down, 'LIVE': right now broadcasting, 'IP': in progress, 'TBC': to be continued
  },
  description: String,
  published: Date,
  country: [String],
  language: [String],
  genres: [String],
  startYear: String,
  endYear: String,
  votes: Number,
  rating: Number,
  coverImg: String,
  networks: [{
    type: Schema.ObjectId,
    ref: 'Network'
  }],
  producers: [{
    type: Schema.ObjectId,
    ref: 'Crew'
  }],
  directors: [{
    type: Schema.ObjectId,
    ref: 'Crew'
  }],
  writers: [{
    type: Schema.ObjectId,
    ref: 'Crew'
  }],
  casts: [{
    type: Schema.ObjectId,
    ref: 'Crew'
  }],
  imdb: {
    id: String,
    url: String,
    rating: Number
  },
  douban: {
    id: String,
    url: String,
    rating: Number
  },
  hashtags: [String],
  playUrl: [{
    vendor: String,
    url: String
  }]

})


ContentSchema.methods = {

}




var Content = mongoose.model('Content', ContentSchema);

var thunkify = require('thunkify');
Content.findOne = thunkify(Content.findOne);
// Content.find = thunkify(Content.find);