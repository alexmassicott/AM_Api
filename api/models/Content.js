'use strict';
let dynamoose = require('dynamoose');
let Schema = dynamoose.Schema;
let moment = require('moment');

let contentSchema = new Schema({
  feed: {
    type: String,
    required:true,
    hashKey: true
  },
  posts:[String],
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

},{
  forceDefault:true
});

module.exports = dynamoose.model('content', contentSchema);
