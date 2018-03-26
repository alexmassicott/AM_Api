import { mongoose } from '../config/database'
import { Document, Schema, Model, model } from 'mongoose'
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

const PostSchema = new Schema({
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
  list_of_media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  list_of_tags: [tagSchema]
})

PostSchema.set('toJSON', {
  transform (doc, ret, options) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

export const Posts: Model<IPost> = mongoose.model<IPost>('Posts', PostSchema, 'Posts')
