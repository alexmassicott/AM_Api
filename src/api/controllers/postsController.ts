'use strict';
import * as moment from 'moment'
import {Posts} from '../models/Posts'
import {Media} from '../models/MediaObjects'
import { Request, Response } from 'express'
let setTags=require("../utils/updatetags")
let uuid=require('uuid4')

function get_a_post(req,res) {

  console.log(req.query.id);
  let id = req.query.id;

   Posts.get({id:id})
   .then(items => {
   let response={
        status:"success",
        data:{
        more_available: false,
        LastEvaluatedKey: null,
        number_of_posts_returned:items.length,
        "posts": [items]
        }
     };
    res.json(response);
   }).catch((err)=>{
     console.log(err);
     res.status(500).json({
       status:'error',
       message:"Post ID doesn't exist"});
   });
};

function get_a_type(req,res) {

  console.log(req.query.limit);
  let type = req.query.type;

      Posts.query("type").eq(type).descending().startAt(req.query.offset).limit(req.query.limit).exec()
         .then(items => {
           console.log(items);
           let response={
                status:"success",
                data:{
                more_available: items.lastKey?true:false,
                LastEvaluatedKey: items.lastKey?items.lastKey:null,
                number_of_posts_returned:items.length,
                "posts": items
                }
             };
           res.json(response);
       }).catch((err)=>{
         console.log(err);
         res.status(500).json({
           status:'error',
           message:err.message})
       });
};

function getUpdatepostParams(body: any): any{

  var data:any = {};
  if (body.new_client) {
    data.client = body.new_client;
  }
  if (body.new_title) {
    data.title = body.new_title;
  }
  if (body.new_summary) {
    data.summary= body.new_summary;
  }
  if (body.new_link) {
    data.link = body.new_link;
  }
  if (body.redirect_link) {
    data.redirect_link = body.redirect_link;
  }
  if (body.new_publication_status) {
    data.publication_status = body.new_publication_status;
  }
  if (body.new_featured===true || body.new_featured===false) {
    data.featured = body.new_featured;
  }
  return data;
}

function createpost(req,res){

     var postid=uuid().replace(/-/g, '');
     var mediaid=uuid().replace(/-/g, '');
     var timestamp=moment().unix();
     var mediaobj={"id" :mediaid, "post_id" :postid, "creation_timestamp": timestamp};

     var full_mediaobj={
          "id": mediaid,
          "post_id": postid,
          "creation_timestamp": timestamp,
          "edit_timestamp": timestamp,
          "status": "new",
          "number_of_changes": 0,
          "data": {
            "1x1": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            },
            "1x2": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            },
            "2x1": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            },
            "3x2": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            },
            "3x1": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            },
            "16x9": {
              "status": "new",
              "number_of_changes": 0,
              "crop": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
              }
            }
          }
        };


    Media.create(mediaobj)
    .then(()=>{
    return Promise.resolve(Posts.create({id:postid,type:req.body.type,list_of_media:[full_mediaobj]}))
    })
    .then(()=>{
     res.json({"status":"success","id":postid,"mediaid":mediaid});
    })
    .catch((err)=>{
     console.log(err);
     res.status(500).send(err.message);
    })
  }

function deletepost(req,res){
  const post_id=req.body.id;
   //To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
   Posts.delete({id: post_id}).then(()=>res.json({status:"success"}))
   .catch((err)=>{
     console.log(err);
     res.status(500).send({
       status:'error',
       message:err})
   });
}



export function create_a_post(req:Request, res:Response): void{
  console.log("creating");
  console.log(req.body.type);
  if(req.body.type)createpost(req,res);
  else{
    res.status(500).send({
      status:'error',
      message:"no type specified"});
  }
};

export function update_a_post(req:Request, res:Response): void{

  if(req.user.role!=="admin"){
    res.status(500).json({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }

  if(req.body.id){
  Posts.update({id:req.body.id}, getUpdatepostParams(req.body))
  .then(data => {
    let tags = [];
    if (req.body.new_list_of_tags) {
      console.log("tags bro");
      tags = req.body.new_list_of_tags;
      // setTags(req.body.id,tags,docClient);
    }
      res.json({
      "status": "success",
      "data": {
        type: "work"}
      });
    });
  }
  else{
    res.status(500).json({
      status:'error',
      message:"no id specified"})
  }
};


export function delete_a_post(req:Request, res:Response): void{

  if(req.user.role!=="admin"){
    res.status(500).send({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  console.log("yo its that dirty");
  if(req.body.id)deletepost(req,res);
  else{
   res.status(500).send({
     status:'error',
     message:"no id specified"})
 }

};

export function show_posts(req:Request, res:Response): void{
  console.log(req.query.id);
  if(req.query.id)get_a_post(req,res);
  else if(req.query.type)get_a_type(req,res)
  else{
  res.status(500).send({
    status:'error',
    message:'no type or id specified'
})
}
};
