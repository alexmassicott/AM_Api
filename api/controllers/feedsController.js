'use strict';
let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let https = require('https');
let ddbutil=require('ddbutil');
let agent = new https.Agent({
   keepAlive: true
});
let docClient = new AWS.DynamoDB.DocumentClient({
   httpOptions:{
      agent: agent
   }});
//////////////
function getfeeds(req,res){
  // ["work", "showcase", "news"]
  var count=0;
const promises = req.query.feed.reduce((acc, type) => {
  let params = {
     "TableName": "Posts",
     "IndexName": "type-publication_status-index",
     "ExpressionAttributeNames": {
       "#q": "type",
       "#ps":"publication_status"
     },
     "KeyConditionExpression": "#q = :v1 AND #ps = :ps",
     "ExpressionAttributeValues": {
       ":v1": type,
       ":ps":"draft_in_progress"
     }
   };

  acc.push(Promise.resolve(ddbutil.query(docClient,params)));

  return acc;
}, []);

  Promise.all(promises)
  .then((items)=>{

  let feed = items.reduce(function (arr, row) {
  return arr.concat(row);
  }, []);

  if (feed.length > 1) {
  feed = feed.sort(function(a, b) {
    var aa = a.creation_timestamp,
      bb = b.creation_timestamp;
    //  console.log(aa);
    if (aa !== bb) {
      if (aa < bb) {
        return 1;
      }
      if (aa > bb) {
        return -1;
      }
    }
    return aa - bb;
    });
  }
    res.json({status:"success",data:{ posts : feed}})
  });


}



exports.get_feed = function(req, res) {
  if (req.query.feed)getfeeds(req, res);
  else {
    res.status(404).json({
      status: 'error',
      message: 'no type or id specified'
    })
  }
};
