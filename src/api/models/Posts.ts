import { mongoose } from '../config/database'
import { Document, Schema, Model, model} from "mongoose";
import { IPost } from '../interfaces/ipost'

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
    _id: Schema.Types.ObjectId,
    id: String,
    type: String,
    creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
    edit_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
    client: { type: String },
    title: { type: String },
    link: { type: String },
    redirect_link: { type: String },
    summary: { type: String, default: '&nbsp;' },
    publication_status: { type: String, default: 'draft_in_progress' },
    featured: { type: Boolean, default: false },
    list_of_media: [{type: Schema.Types.ObjectId, ref: 'Media'}],
    list_of_tags: [tagSchema]
  }
)

export const Posts:Model<IPost> = mongoose.model<IPost>('Posts', PostSchema, "Posts")
