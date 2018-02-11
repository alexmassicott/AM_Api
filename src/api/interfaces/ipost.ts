import {dynamoose} from '../config/database';
import {IPostMedia} from './ipostMedia'

export interface IPost extends dynamoose.ModelConstructor<any,any,any>{
  id:string;
  type:string;
  creation_timestamp:number;
  edit_timestamp:number;
  redirect_link:string;
  title:string;
  summary:string;
  publication_status:string;
  featured:boolean;
  list_of_media:IPostMedia[];
  list_of_tags:any[];
}
