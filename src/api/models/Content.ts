'use strict';
import { Document, Schema, Model, model} from "mongoose";
import { IContent } from '../interfaces/icontent'

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

export const Content: Model<IContent> = model<IContent>('content', contentSchema)
