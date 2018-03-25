
import { Document, Schema, Model, model} from "mongoose";
import { IUser } from '../interfaces/iuser'

const schema = new Schema({
  username: { type: String, hashKey: true, required: true },
  password: { type: String },
  role: { type: String },
  creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
  edit_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) }
})

export const User:Model<IUser> = model<IUser>('users', schema)
