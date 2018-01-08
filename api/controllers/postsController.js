'use strict';
let moment = require('moment');
let uuid=require('uuid4');
let dynamoose = require('dynamoose');
let Posts = dynamoose.model('Posts');
let Media = dynamoose.model('mediaobjects');

/////////////////////////////////////
let setTags=require("../utils/updatetags");

////////////////////////////////////



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
         res.status(404).json({
           status:'error',
           message:err});
       });
};

function get_a_type(req,res) {

  console.log(req.query.type);
  let type = req.query.type;

      Posts.query("type").eq(type).exec()
         .then(items => {
           console.log('Items found:', items.length);
           let response={
                status:"success",
                data:{
                more_available: false,
                LastEvaluatedKey: null,
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

function getUpdatepostParams(req) {

  var data = new Object();
  if (req.new_client) {
    data.client = req.new_client;
  }
  if (req.new_title) {
    data.title = req.new_title;
  }
  if (req.new_summary) {
    data.summary= req.new_summary;
  }
  if (req.new_link) {
    data.link = req.new_link;
  }
  if (req.redirect_link) {
    data.redirect_link = req.redirect_link;
  }
  if (req.new_publication_status) {
    data.publication_status = req.new_publication_status;
  }
  if (req.new_featured===true || req.new_featured===false) {
    data.featured = req.new_featured;
  }
  data.ReturnValues="ALL_NEW";
  return data;
}

exports.create_a_post = function(req, res) {
  console.log("creating");
  console.log(req.body.type);
  if(req.body.type)createpost(req,res);
  else{
    res.status(500).send({
      status:'error',
      message:"no type specified"});
  }
};

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
    return Promise.resolve(Posts.create({id:postid,type:req.body.type,creation_timestamp:timestamp,summary:"&nbsp;",list_of_media:[full_mediaobj]}))
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

  let post_id=req.body.id;
   //To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
   Posts.delete({id: post_id}).then(()=>res.json({status:"success"}))
   .catch((err)=>{
     console.log(err);
     res.status(500).send({
       status:'error',
       message:err})
   });
}

exports.update_a_post = function(req, res) {

  if(!req.user.role==="admin"){
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


exports.delete_a_post = function(req, res) {
  if(!req.user.role==="admin"){
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

exports.show_posts = function(req, res) {
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
