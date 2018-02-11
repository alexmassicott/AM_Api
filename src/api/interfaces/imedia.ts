import {dynamoose} from '../config/database'

export interface IMedia extends dynamoose.ModelConstructor<any,any,any>{
  id:string;
  post_id:boolean;
  creation_timestamp:boolean;
  edit_timestamp:boolean;
}
