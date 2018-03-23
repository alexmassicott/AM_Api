import { dynamoose } from '../config/database'
import { IPost } from '../interfaces/ipost'
const Schema = dynamoose.Schema

const cropSchema = {
  crop: {
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  },
  status: { type: String, default: 'new' },
  number_of_changes: { type: Number, default: 0 },
  url: { type: String }
}

const tagSchema = {
  name: String,
  visible: Boolean
}

const media = {
  id: String,
  post_id: String,
  original_data: {
    originalname: String,
    mimetype: String,
    url: String,
    size: Number
  },
  creation_timestamp: {
    type: Number,
    default: Math.floor(Date.now() / 1000)
  },
  edit_timestamp: {
    type: Number,
    default: Math.floor(Date.now() / 1000)
  },
  type: String,
  status: String,
  number_of_changes: { type: Number, default: 0 },
  data: {
    cover_image: cropSchema,
    '1x1': cropSchema,
    '1x2': cropSchema,
    '3x1': cropSchema,
    '3x2': cropSchema,
    '2x1': cropSchema,
    '16x9': cropSchema
  }
}

const PostSchema = new Schema(
  {
    id: { type: String, required: true, hashKey: true },
    type: {
      type: String,
      required: true,
      index: { global: true, rangeKey: 'creation_timestamp', name: 'type-creation_timestamp-index' }
    },
    creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
    edit_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
    client: { type: String },
    title: { type: String },
    link: { type: String },
    redirect_link: { type: String },
    summary: { type: String, default: '&nbsp;' },
    publication_status: { type: String, default: 'draft_in_progress' },
    featured: { type: Boolean, default: false },
    list_of_media: {
      type: 'list',
      list: [media]
    },
    list_of_tags: {
      type: 'list',
      list: [tagSchema]
    }
  },
  {
    useNativeBooleans: true,
    useDocumentTypes: true,
    forceDefault: true
  }
)

export const Posts = dynamoose.model('Posts', PostSchema) as IPost
