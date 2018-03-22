'use strict';
import { Request, Response } from 'express';
import { Posts } from '../models/Posts';
import { Content } from '../models/Content';
import { mapOrder } from '../utils/mapOrder'
import { IPost } from '../interfaces/ipost'
//////////////

function getfeeds(req:Request, res:Response, next: Function):void{
  let count=0;
  const promises = req.query.feed.reduce((acc:Array<any>, type: String) => {
  acc.push(Content.get({feed:"list_of_live_"+type})
  .then(items=>{
    return Promise.resolve(Posts.batchGet(items.posts.map(item=>{return {id:item}})))}))
    return acc;
  }, []);
  Promise.all(promises)
  .then((items:any[])=>{
    const feed:any[] = items.reduce(function (arr:any[], row:any[]) {
    return arr.concat(row);}, []);
    let orderList:IPost[] = mapOrder(feed,items,'id');
    res.json({status:"success",data:{ posts: orderList }})
  })
  .catch(err=>{next(err)})
}



export function get_feed(req:Request, res:Response, next: Function):void {
  if (req.query.feed)getfeeds(req, res, next);
  else next( new Error('No feeds supplied'))
};
