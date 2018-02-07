'use strict';
import {dynamoose} from '../config/database';
let Schema = dynamoose.Schema;
let moment = require('moment');


export interface IPost extends dynamoose.ModelConstructor<any,any,any>{
  id:string;
  type:string;
  creation_timestamp:number;
  edit_timestamp:number;
  redirect_link:string;
  title:string;
  summary:string;
  publication_status:string;
  featured:boolean;
  list_of_media:Array<IPostMedia>;
  list_of_tags:Array<any>;
}

export interface IPostMedia{
  id:string;
  post_id:string;
  creation_timestamp:number;
  edit_timestamp:number;
  original_data:any;
  status:string;
  number_of_changes:number;
  data:any;
}

const cropSchema={
  crop:{
    x:Number,
    y:Number,
    width:Number,
    height:Number
  },
  status:String,
  number_of_changes:Number,
  url:String
};

const tagSchema={
    name:String,
    visible:Boolean
  };

const media={
    id :String,
    post_id:String,
    creation_timestamp: Number,
    original_data:{
      originalname:String,
      mimetype:String,
      url:String,
      size:Number
    },
    edit_timestamp :{
      type:Number,
      default:moment().unix()
    },
    status:String,
    number_of_changes:Number,
    data:{
      "1x1":cropSchema,
      "1x2":cropSchema,
      "3x1":cropSchema,
      "3x2":cropSchema,
      "2x1":cropSchema,
      "16x9":cropSchema
      }
    };

const PostSchema = new Schema({
  id: { type: String, required: true, hashKey: true },
  type: { type: String, required: true, index: { global: true, rangeKey: 'creation_timestamp', name: 'type-creation_timestamp-index' } },
  creation_timestamp: { type: Number, default: moment().unix() },
  edit_timestamp: { type: Number, default: moment().unix() },
  client: { type: String },
  title: { type: String },
  link: { type: String },
  redirect_link: { type: String },
  summary: { type: String, default:'&nbsp;' },
  publication_status: { type: String },
  featured: { type: Boolean, default: false },
  list_of_media: {
    type: 'list',
    list: [media]
  },
  list_of_tags: {
    type: "list",
    list: [tagSchema]
  }
  }, {
    useNativeBooleans: true,
    useDocumentTypes: true,
    forceDefault:true
  });

export const Posts =  dynamoose.model('Posts', PostSchema) as IPost;
