import { Document, Schema, Model, model } from 'mongoose'
import { ITag } from '../interfaces/itag'

export const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    hashKey: true
  },
  posts: { type: [String] },
  creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) }
})

export const Tags: Model<ITag> = model<ITag>('Tags', tagSchema, 'Tags')
