'use strict';
import { Request, Response, Next } from 'express';
import {Posts} from '../models/Posts';
import {Content} from '../models/Content';
//////////////

function getfeeds(req:Request, res:Response, next: Next):void{
  // ["work", "showcase", "news"]
  let count=0;
  const promises = req.query.feed.reduce((acc:Array<any>, type:String) => {

  // acc.push(Promise.resolve(Posts.query('type').eq(type).where("publication_status").eq("live").exec()));
  acc.push(Content.get({feed:"list_of_live_"+type})
    .then(items=>{
      return Promise.resolve(Posts.batchGet(items.posts.map(item=>{return {id:item}})))}))
  return acc;
}, []);

  Promise.all(promises)
  .then((items)=>{

  const feed = items.reduce(function (arr:Array<any>, row:Array<any>) {
  return arr.concat(row);
  }, []);
    res.json({status:"success",data:{ posts : feed}})
  })
  .catch(err=>{next(err)})

}



export function get_feed(req:Request, res:Response, next:Next):void {
  if (req.query.feed)getfeeds(req, res, next);
  else next( new Error('No feeds supplied'))
};
