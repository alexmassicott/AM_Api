'use strict';
import {dynamoose} from '../config/database'
import {IMedia} from '../interfaces/imedia'
const Schema = dynamoose.Schema

export const mediaSchema = new Schema({
  id:{
    type: String,
    required:true,
    hashKey: true
  },
  post_id: {
    type: String,
    default: null
  },
  creation_timestamp:{ type: Number, default: Math.floor(Date.now()/1000) },
  edit_timestamp:{ type: Number, default: Math.floor(Date.now()/1000) }
});

export const Media = dynamoose.model('mediaobjects', mediaSchema) as IMedia;
