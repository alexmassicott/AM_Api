'use strict';
import {dynamoose} from '../config/database';
let Schema = dynamoose.Schema;
let moment = require('moment');

export interface ITag extends dynamoose.ModelConstructor<any,any,any>{
  name:string;
  visible:boolean;
}

export const tagSchema = new Schema({
  name: {
    type: String,
    required:true,
    hashKey: true
  },
  posts:{ type: [String] },
  creation_timestamp:{ type: Number },
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

},{
  forceDefault:true
});

export const Tags = dynamoose.model('Tags', tagSchema) as ITag;