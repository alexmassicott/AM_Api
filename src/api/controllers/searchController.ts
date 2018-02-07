'use strict';
import * as _ from 'lodash'
import { IPost, Posts } from '../models/Posts'
import { Tags } from '../models/Tags'
import { Response, Request } from 'express'
//////////////
async function getsearch(req:Request): Promise<any>{

  let query:any[] = req.query.query.split(",");
  let queryItems:any[] = [];
  let result:any[]
  let result2:any[]
  let posts:IPost[]

  result = await Tags.batchGet(query.map(function(i) {return {name: i} }))
  posts = (_.intersection.apply(_,(result.map((j)=>{return j.posts}))))
  result2 = await Posts.batchGet(posts.map(function(id) {return {id: id} }))
  queryItems=queryItems.concat(result2);

   // done();
  return queryItems;
}


export async function get_search(req:Request, res:Response): Promise<any> {
  let result;
  const query = req.query.query;
  try{
    result = await getsearch(req);
    res.json({
       status: "success",
       status_msg: "",
       data: {
           search_query: query,
           more_available: false,
           total_search_results_returned: result.length,
           list_of_search_results: result
        }
      });
  }
  catch(err){
    res.json({
      status:'success',
      status_msg:query?'':'no query given',
      data: {
          search_query: query?query:null,
          more_available: false,
          total_search_results_returned: 0,
          list_of_search_results: []
        }
      })
  }
};
