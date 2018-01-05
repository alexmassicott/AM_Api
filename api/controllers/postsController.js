'use strict';
let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let https = require('https');
let ddbutil=require('ddbutil');
let moment = require('moment');
let uuid=require('uuid4');

let agent = new https.Agent({
   keepAlive: true
});
let docClient = new AWS.DynamoDB.DocumentClient({
   httpOptions:{
      agent: agent
   }});
/////////////////////////////////////
let setTags=require("../utils/updatetags");
let tablename="Posts";

////////////////////////////////////



function get_a_post(req,res) {

  console.log(req.query.id);
  let id = req.query.id;
  const queryParams = {
      TableName: tablename,
      ExpressionAttributeNames: {
      "#q": "id"
    },
      KeyConditionExpression: "#q = :v1",
      ScanIndexForward: false,
      ExpressionAttributeValues: {
          ":v1": id
      }
  };

   ddbutil.query(docClient, queryParams)
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
         res.status(404).json({
           status:'error',
           message:err});
       });
};

function get_a_type(req,res) {

  console.log(req.query.type);
  let type = req.query.type;
  const queryParams = {
      TableName: tablename,
      IndexName: "type-publication_status-index",
      ExpressionAttributeNames: {
      "#q": "type"
    },
      KeyConditionExpression: "#q = :v1",
      ScanIndexForward: false,
      ExpressionAttributeValues: {
          ":v1": type
      }
  };

   ddbutil.query(docClient, queryParams)
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
         res.status(404).json({
           status:'error',
           message:err})
       });
};

function getUpdatepostParams(req) {

  var data = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: {}
  };
  data.Key={ "id" : req.id };
  data.TableName=tablename;
  data.ExpressionAttributeNames["#Edit"] = "edit_timestamp";
  data.UpdateExpression = "SET #Edit=:e";
  data.ExpressionAttributeValues[":e"] = moment().unix();
  if (req.new_client) {
    data.ExpressionAttributeNames["#Client"] = "client";
    data.ExpressionAttributeValues[":client"] = req.new_client;
    data.UpdateExpression += ",#Client = :client";
  }
  if (req.new_title) {
    data.ExpressionAttributeNames["#Title"] = "title";
    data.ExpressionAttributeValues[":title"] = req.new_title;
    data.UpdateExpression += ",#Title = :title";
  }
  if (req.new_summary) {
    data.ExpressionAttributeNames["#S"] = "summary";
    data.ExpressionAttributeValues[":summary"] = req.new_summary;
    data.UpdateExpression += ",#S = :summary";
  }
  if (req.new_link) {
    data.ExpressionAttributeNames["#Link"] = "link";
    data.ExpressionAttributeValues[":link"] = req.new_link;
    data.UpdateExpression += ",#Link = :link";
  }
  if (req.redirect_link) {
    data.ExpressionAttributeNames["#Red_Link"] = "redirect_link";
    data.ExpressionAttributeValues[":red_link"] = req.redirect_link;
    data.UpdateExpression += ",#Red_Link = :red_link";
  }
  if (req.new_publication_status) {
    data.ExpressionAttributeNames["#Ps"] = "publication_status";
    data.ExpressionAttributeValues[":status"] = req.new_publication_status;
    data.UpdateExpression += ",#Ps = :status";
  }
  if (req.new_featured===true || req.new_featured===false) {
    data.ExpressionAttributeNames["#Feat"] = "featured";
    data.ExpressionAttributeValues[":featured"] = req.new_featured;
    data.UpdateExpression += ",#Feat = :featured";
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
     var mediaobj={"id" :mediaid, "post_id" :postid, "creation_timestamp": timestamp,"edit_timestamp" : timestamp, "status": "new", "number_of_changes": 0,
             "data":{
                   "1x1":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}},
                   "1x2":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}},
                   "2x1":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}},
                   "3x2":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}},
                   "3x1":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}},
                   "16x9":{"status":"new","number_of_changes":0,"crop":{"x":0,"y":0,"width":0,"height":0}}
               }
             }

       var params = {
        RequestItems: {
          "Posts": [{
              PutRequest: {
                Item: {
                  "id":postid,
                  "type":req.body.type,
                  "list_of_media": [mediaobj],
                   "creation_timestamp": timestamp,
                   "featured": false,
                   "edit_timestamp" : timestamp,
                   "publication_status":"draft_in_progress",
                   "summary":"&nbsp;"
                  }
                }
              }],
          "mediaobjects": [{
                PutRequest: {
                  Item:mediaobj
                }
             }]
          }
        };


  docClient.batchWrite(params, function(err, data) {
    console.log(err);
      if (err)return res.status(500).send({status:'error',message:err});
      else{
        res.json({"status":"success","id":postid,"mediaid":mediaid});
      }
    });

}

function deletepost(req,res){
  console.log("deleting");
  let post_id=req.body.id;
  let params = {
     TableName: tablename,
     Key: {
       "id": post_id
     },
     ReturnValues:"ALL_OLD"
   };
   //To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
   ddbutil.delete(docClient, params).then(()=>res.json({status:"success"}))
   .catch((err)=>{
     console.log(err);
     res.status(500).send({
       status:'error',
       message:err})
   });
}

exports.update_a_post = function(req, res) {

  if(req.body.id){
  ddbutil.update(docClient, getUpdatepostParams(req.body))
  .then(data => {
    let tags=[];

    if(req.body.new_list_of_tags){
      console.log("tags bro");
    tags=req.body.new_list_of_tags;
    setTags(req.body.id,tags,docClient);
  }
  const {type} = data.Attributes;
  res.json({"status":"success","data" : {type: type} });

});
  }
  else{
    res.status(500).send({
      status:'error',
      message:"no id specified"})
  }
};


exports.delete_a_post = function(req, res) {
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
