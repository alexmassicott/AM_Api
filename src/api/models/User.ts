'use strict';
import {dynamoose} from '../config/database';
import {IUser} from '../interfaces/iuser'
const Schema = dynamoose.Schema;

const schema = new Schema({
      username: { type: String, hashKey: true, required: true },
      password: { type: String },
      role: { type: String },
      creation_timestamp:{ type: Number, default: Math.floor(Date.now()/1000) },
      edit_timestamp:{ type: Number, default:  Math.floor(Date.now()/1000) }
    });

export const User = dynamoose.model('users', schema) as IUser;
