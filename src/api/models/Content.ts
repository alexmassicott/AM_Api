'use strict';
import {dynamoose} from '../config/database';
let Schema = dynamoose.Schema;
let moment = require('moment');

export interface IContent extends dynamoose.ModelConstructor<any,any,any>{
  feed:string;
  posts:Array<string>;
  edit_timestamp:number;
}

export var contentSchema = new Schema({
  feed: {
    type: String,
    required:true,
    hashKey: true
  },
  posts:{type: [String]},
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

},{
  forceDefault:true
});

export const Content = dynamoose.model('content', contentSchema) as IContent;
