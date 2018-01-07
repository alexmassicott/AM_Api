'use strict';
let dynamoose = require('dynamoose');
let Schema = dynamoose.Schema;
let moment = require('moment');

var tagSchema = new Schema({
  name: {
    type: String,
    required:true,
    hashKey: true
  },
  posts:[String],
  creation_timestamp:Number,
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

},{
  forceDefault:true
});

module.exports = dynamoose.model('Tags', tagSchema);
