// var AWS = require("aws-sdk");
// var https = require('https');
// var moment=require('moment');
// var agent = new https.Agent({
//    keepAlive: true
// });
//
//
// AWS.config.loadFromPath('../config.js');
//
// var docClient = new AWS.DynamoDB.DocumentClient({
//   httpOptions: {
//     agent: agent
//   }
// });

function getExpressions(key,lom) {


  var data = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: {}
  };
  data.Key={ "id" :key };
  data.TableName="Posts";
  data.ExpressionAttributeNames["#lom"] = "list_of_media";
  data.UpdateExpression = "SET #lom=:lom";
  data.ExpressionAttributeValues[":lom"] = lom;

  return data;
}


module.exports = (postid, media, dc) => {

  var docClient=dc;
  var mediaKeys = [];
  for (var i = 0; i < media.length; i++) {
    var param = {
      id : media[i]
    };
    mediaKeys.push(param);
  }

  var params = {
    RequestItems: {
      "mediaobjects": {
        Keys: mediaKeys
          }
        }
      };

  var getMediaPromise = docClient.batchGet(params).promise();
  getMediaPromise.then((data)=>{
    var list_of_media=data.Responses.mediaobjects;

    var sortedArray=list_of_media;
    sortedArray =  list_of_media.sort(function(a, b) {
      var aa = a.creation_timestamp,
          bb = b.creation_timestamp;
        //  console.log(aa);
      if (aa !== bb) {
          if (aa > bb) { return 1; }
          if (aa < bb) { return -1; }
      }
      return aa - bb;
    });

    var params = getExpressions(postid,sortedArray);
    docClient.update(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
        console.log(data);
      }
    })
}).catch(function(err) {
    console.log(err);
  });

}
// var post_id="fc1479e14fa94baa8ca83cad6e294849";
// copymedia(post_id,["bb7fc7c969844d9aa273b07012dc2cb2","2445be99e80a4964814d00103992f86e"]);
