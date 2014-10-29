/**
 * Mongodb - Schema of Group
 */

 'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  displayTitle: {
    type: String,
    default: 'group'
  },
  visible: {
    type: String,
    default: 'private'
  }
});


GroupSchema.methods = {

}

var Group = mongoose.model('Group', GroupSchema);

var thunkify = require('thunkify');
// Group.findOneAndUpdate = thunkify(Group.findOneAndUpdate);
Group.findOne = thunkify(Group.findOne);