'use strict';
let dynamoose = require('dynamoose');
let Schema = dynamoose.Schema;
let moment = require('moment');

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

let PostSchema = new Schema({
  id: {
      type: String,
      required: true,
      hashKey: true
    },
    type: {
      type: String,
      required: true,
      index: {
        global: true,
        rangeKey: 'creation_timestamp',
        name: 'type-creation_timestamp-index'
      }
    },
    creation_timestamp: Number,
    edit_timestamp: {
      type: Number,
      default: moment().unix()
    },
    client: String,
    title: String,
    link: String,
    redirect_link: String,
    summary: String,
    publication_status: String,
    featured: Boolean,
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

module.exports = dynamoose.model('Posts', PostSchema);
