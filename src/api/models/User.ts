'use strict';
import {dynamoose} from '../config/database';
let Schema = dynamoose.Schema;
import * as moment from 'moment';

export interface IUser extends dynamoose.ModelConstructor<any,any,any>{
  username:string;
  password:string;
  role:string;
}

const schema = new Schema({
      username: { type: String, hashKey: true, required: true },
      password: { type: String },
      role: { type: String }
    });

export const User = dynamoose.model('users', schema) as IUser;
