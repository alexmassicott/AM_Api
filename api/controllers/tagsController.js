'use strict';
let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let https = require('https');
let ddbutil=require('ddbutil');
let moment = require('moment');
let agent = new https.Agent({
   keepAlive: true
});
let docClient = new AWS.DynamoDB.DocumentClient({
   httpOptions:{
      agent: agent
   }});
//////////////
function deletetag(req,res){

}

function createtag(req,res){

  var tagobj={
      "name": req.body.name,
      "creation_timestamp": moment().unix(),
      "type":"tag"
    };

    var params = {
      TableName: "Tags",
      Item: tagobj
    };
    ddbutil.put(docClient,params).then(
      res.json({ "status" : "success" , "name" : req.body.name }));

}

function gettags(req,res){
  var params = {
    TableName: "Tags",
    ProjectionExpression: "#n",
    ExpressionAttributeNames: {
         "#n": "name",
     }

  };
  ddbutil.scan(docClient,params)
  .then((items)=>{
   console.log(items);
    res.json({ "status":"success", "data" : { "tags" : items }});

  }).catch((err)=>{
    console.log(err);
    res.status(404).json({
      status: 'error',
      message: "There was a error"
    })
  });
}

exports.delete_a_tag = function(req, res) {
  if (req.body.name)deletetag(req, res);
  else {
    res.status(404).json({
      status: 'error',
      message: 'no name specified'
    })
  }
};

exports.create_tag = function(req, res) {
  if (req.body.name)createtag(req, res);
  else {
    res.status(404).json({
      status: 'error',
      message: 'no name specified'
    })
  }
};

exports.get_tags = function(req, res) {
  gettags(req, res);
};
