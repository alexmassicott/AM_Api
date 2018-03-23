
import { dynamoose } from '../config/database'
import { ITag } from '../interfaces/itag'
const Schema = dynamoose.Schema

export const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      hashKey: true
    },
    posts: { type: [String] },
    creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) }
  },
  {
    forceDefault: true
  }
)

export const Tags = dynamoose.model('Tags', tagSchema) as ITag
