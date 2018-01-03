'use strict';
let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let https = require('https');
let ddbutil=require('ddbutil');
let _ = require('lodash');
let agent = new https.Agent({
   keepAlive: true
});
let docClient = new AWS.DynamoDB.DocumentClient({
   httpOptions:{
      agent: agent
   }});
//////////////
function getsearch(req,res){

var query=req.query.query.split(",");
var queryItems=[];
var params = {
  RequestItems: {
    "Tags": {
      "Keys": query.map(function(i) {
        return {
          "name": i
        }
      }),
        ProjectionExpression:"posts"
    }
  }
};

var getPosts = docClient.batchGet(params).promise();
getPosts.then((result) => {

let posts = result.Responses.Tags.filter(word => word.postslength > 6);

 if(posts){
 posts = (_.union.apply(_,(result.Responses.Tags.map((j)=>{return j.posts.values}))));

  var params = {
    RequestItems: {
      "Posts": {
        "Keys": posts.map(function(i) {
          return {
            "id": i
          }
        })

      }
    }
  };

  let getsearchPosts = docClient.batchGet(params).promise();
  return Promise.resolve(getsearchPosts);
 }
 else{
      res.json({
    "status": "success",
    "status_msg": "",
    "data": {
        "search_query": req.query.query,
        "more_available": false,
        "total_search_results_returned": queryItems.length,
        "list_of_search_results": []

      }
    });

 }

}).then((result) => {
  queryItems=queryItems.concat(result.Responses.Posts);
  // done();
  res.json({
    "status": "success",
    "status_msg": "",
    "data": {
        "search_query": req.query.query,
        "more_available": false,
        "total_search_results_returned": queryItems.length,
        "list_of_search_results": queryItems

      }
    });
}).catch((err)=>{
console.log(err);
  res.json({
    "status": "success",
    "status_msg": "",
    "data": {
        "search_query": req.query.query,
        "more_available": false,
        "total_search_results_returned": 0,
        "list_of_search_results": []

      }
    });
});

}



exports.get_search = function(req, res) {
  if (req.query.query)getsearch(req, res);
  else {
    res.json({
  "status": "success",
  "status_msg": "",
  "data": {
      "search_query": req.query.query,
      "more_available": false,
      "total_search_results_returned": 0,
      "list_of_search_results": []

    }
  });
  }
};
