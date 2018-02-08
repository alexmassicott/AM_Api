'use strict';
import {dynamoose} from '../config/database'
const Schema = dynamoose.Schema

export interface IContent extends dynamoose.ModelConstructor<any,any,any>{
  feed:string;
  posts:Array<string>;
  edit_timestamp:number;
}

export const contentSchema = new Schema({
  feed: {
    type: String,
    required:true,
    hashKey: true
  },
  posts:{type: [String]},
  edit_timestamp:{
    type:Number,
    default:Date.now()/1000
  }

},{
  forceDefault:true
});

export const Content = dynamoose.model('content', contentSchema) as IContent;
