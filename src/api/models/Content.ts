'use strict';
import {dynamoose} from '../config/database'
import {IContent} from '../interfaces/icontent'
const Schema = dynamoose.Schema

export const contentSchema = new Schema(
  {
    feed: {
      type: String,
      required: true,
      hashKey: true
    },
    posts: { type: [String] },
    edit_timestamp: {
      type: Number,
      default: Math.floor(Date.now() / 1000)
    }
  },
  {
    forceDefault: true
  }
)

export const Content = dynamoose.model('content', contentSchema) as IContent
