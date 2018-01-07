'use strict';
let dynamoose = require('dynamoose');
let Schema = dynamoose.Schema;
let moment = require('moment');

var UserSchema = new Schema({
  username: {
    type: String,
    required:true,
    hashKey: true
  },
  password: {
    type: String,
    default: null
  },
  role:{
    type:String,
    default:"user"
  },
  email:String,
  creation_timestamp:Number,
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

});

module.exports = dynamoose.model('users', UserSchema);
