'use strict';
import {dynamoose} from '../config/database';
let Schema = dynamoose.Schema;
let moment = require('moment');


export interface IMedia extends dynamoose.ModelConstructor<any,any,any>{
  id:string;
  post_id:boolean;
  creation_timestamp:boolean;
  edit_timestamp:boolean;
}

export const mediaSchema = new Schema({
  id: {
    type: String,
    required:true,
    hashKey: true
  },
  post_id: {
    type: String,
    default: null
  },
  creation_timestamp:{ type: Number },
  edit_timestamp:{
    type:Number,
    default:moment().unix()
  }

});

export const Media = dynamoose.model('mediaobjects', mediaSchema) as IMedia;
