'use strict';
let dynamoose = require('dynamoose');
let Schema = dynamoose.Schema;
let moment = require('moment');

let mediaSchema = new Schema({
  id: {
    type: String,
    required:true,
    hashKey: true
  },
  post_id: {
    type: String,
    default: null
  },
  creation_timestamp:Number,
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

});

module.exports = dynamoose.model('mediaobjects', mediaSchema);
