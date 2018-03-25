import { mongoose } from '../config/database'
import { Document, Schema, Model, model} from "mongoose";
import { IPostMedia } from '../interfaces/ipostMedia'

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

export const mediaSchema = new Schema({
  id: {type: String, required: true},
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
})

export const Media:Model<IPostMedia> = mongoose.model<IPostMedia>('Media', mediaSchema, 'Media')
