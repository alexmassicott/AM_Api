let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let s3 = new AWS.S3();
let https = require('https');
let ddbutil=require('ddbutil');
let moment = require('moment');
let uuid=require('uuid4');
let async = require('async');
let _ = require('lodash');
let gm = require('gm').subClass({
  imageMagick: true
});
let agent = new https.Agent({
   keepAlive: true
});
let docClient = new AWS.DynamoDB.DocumentClient({
   httpOptions:{
      agent: agent
   }});
let tinify = require("tinify");
tinify.key = "aV6X6prtKFLyfe1XZX50qrDyNsCwfFQb";
const {updateOriginalData,updateCropData,getUpdatePostExpressions,getPostLom,updatePostLom} = require("../utils/mediautils");
////////////////////////////////////////
const bucketName = "alexmassbucket";
let pathParams, image, imageName, srcKey,typeMatch,filetype;
var srcBucket = bucketName;
var dstBucket = bucketName + "-output";
///////////////////////////////////////////




function updatemedia(req, res) {

  let post_id;
  if (req.body.image && req.body.id && req.body.metadata && req.body.action == "upload") {

    var b64string = req.body.image;
    image = new Buffer(b64string.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    var originalFilename = req.body.metadata.originalFilename;
    typeMatch = originalFilename.match(/\.([^.]*)$/);
    filetype = typeMatch[1].toLowerCase();
    imageName =  req.body.id;
    var url = 'images/' + `${imageName}` + "." + filetype;
    req.body.metadata.url = url;
    var b64params = putBase64Params(bucketName, url, image, filetype);

    s3.putObject(b64params, function(err, data) {
      if (err) callback(null, err);
      updateOriginalData(req, res, "pending",  docClient);

    });

  } else if (req.body.action == "crop" && req.body.id) {

    imageName = req.body.id;
    var getPostId = docClient.get(getMediaData(req.body.id)).promise();
    getPostId.then((data) => {
      post_id = data.Item.post_id;

      var params = {
        TableName: "Posts",
        Key: {
            "id": post_id
        },
        ExpressionAttributeNames: {
             "#n": "list_of_media",
         },
        ProjectionExpression:"#n"
      };
      let getPostLOM=docClient.get(params).promise();
      getPostLOM.then((data)=>((data.Item.list_of_media)))
      .then((data)=>{
        let mo = data.filter(function(a){return a.id==req.body.id});
        if (mo[0].original_data) {
          srcKey = mo[0].original_data.url;
          typeMatch = srcKey.match(/\.([^.]*)$/);
          filetype = typeMatch[1].toLowerCase();
          cropImage();
        }
      });

    }).catch(function(err) {
      console.log(err);
    });
    var _sizeArray = [req.body.crop_ratio];
    const cropImage = () => {

      async.forEachOf(_sizeArray, function(value, key, cb) {
        console.log(value);
        async.waterfall([
          function download(next) {
            console.time("downloadImage");
            // Download the image from S3 into a buffer.
            // sadly it downloads the image several times, but we couldn't place it outside
            // the variable was not recognized
            s3.getObject({
              Bucket: srcBucket,
              Key: srcKey
            }, next);
            console.timeEnd("downloadImage");
          },
          function processImage(response, next) {


            var width = parseInt(req.body.crop_data.width);
            var height = parseInt(req.body.crop_data.height);
            var x = parseInt(req.body.crop_data.x);
            var y = parseInt(req.body.crop_data.y);

            gm(response.Body, imageName + "." + filetype).crop(width, height, x, y).toBuffer(
              filetype.toUpperCase(),
              function(err,
                buffer) {
                if (err) {
                  next(err);
                } else {

                    tinify.fromBuffer(buffer).toBuffer(function(err, resultData) {
                        if (err) console.log(err);
    // ...

                  gm(resultData).filesize(function(err, filesize) {
                    console.log("crop data");
                    var bytesize = filesize.split("B");
                    var _filesize = Math.floor(parseInt(bytesize[0]) / 1000) + "kb";

                    var cropdata = {
                      "extension": filetype,
                      "file_size": _filesize,
                      "crop": {
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height
                      },
                      "url": 'images/' + `${imageName}` + "." + _sizeArray[key] + "." + filetype,
                      "status": "processed"
                    };
                    updateCropData(req.body.id, value, cropdata); //
                    next(null, buffer);
                  });
             });

                }
              });

          },
          function uploadResize(crop, next) {

            s3.putObject({
              Bucket: dstBucket,
              Key: 'images/' + `${imageName}` + "." + value + "." + filetype,
              Body: crop,
              ContentType: filetype.toUpperCase()
            }, next);

          }
        ], (err, result) => {
          if (err) {
            console.error(err);
          }
          // result now equals 'done'
          console.log("End of step " + key);
          cb();
        });
      }, (err, result) => {
        if (err) {
           console.log(err);
           res.status(404).json({
             status:'error',
             message: err})

        }
        console.log("success");
        res.json({
          "status": "success"
        });
      })
    }
  } else {
    // Request wasn't supplied information it needs to make updates
    res.status(404).json({
      status:'error',
      message: "Missing parameters required to make task"})

  }
};


function createmedia(req,res){

     var postid=req.body.post_id;
     var mediaid=uuid().replace(/-/g, '');
     var timestamp=moment().unix();
     var mediaobj={
        "id": mediaid,
        "post_id": postid,
        "creation_timestamp": timestamp,
        "edit_timestamp": timestamp,
        "status": "new",
        "number_of_changes": 0,
        "data": {
          "status": "new"
        }
      };
     var params = {
       TableName: "Posts",
       Key: {
           "id": postid
       },
       ExpressionAttributeNames: {
         "#LOM": "list_of_media"
       },
       ExpressionAttributeValues: {":mo": [mediaobj]},
       UpdateExpression:"SET #LOM = list_append(#LOM, :mo)"
     };


     ddbutil.update(docClient,params)
     .then((data) => {
     var media_params = {
       TableName: "mediaobjects",
       Item: mediaobj
     };
     return Promise.resolve(ddbutil.put(docClient,media_params));
     })
     .then(()=>{
       res.json({
         "status": "success",
         "data":
         {
         "id": mediaid
         }
       });
     })
     .catch((err)=> {
       console.log(err);
       res.status(404).json({
         status:'error',
         message: "Internal Error"})
       });
}


function get_a_media(req,res){
  let post_id = req.query.post_id;
  let params = getPostLom(post_id);

  ddbutil.get(docClient, params).then((data) => {
    let list_of_media = data.Item.list_of_media;

    let sortedArray = list_of_media;
    if (sortedArray.length > 1) {
      sortedArray = list_of_media.sort(function(a, b) {
        let aa = a.creation_timestamp,
          bb = b.creation_timestamp;
        //  console.log(aa);
        if (aa !== bb) {
          if (aa > bb) {
            return 1;
          }
          if (aa < bb) {
            return -1;
          }
        }
        return aa - bb;
      })

    }
    res.json({
      "status": "success",
      "data": {
        "media": sortedArray
      }});

  }).catch((err) => {
    console.log(err);
    res.status(404).json({
      status: 'error',
      message: err
    });
  });
}

function deletemedia(req,res){
let post_id=req.body.post_id;
let updatedList;
media_id = req.body.id;
let params = {
  TableName: "mediaobjects",
  Key: {
    "id": media_id
  },
  ReturnValues: "ALL_OLD"
};

ddbutil.delete(docClient,params).then((data) => {
    console.log(data);
    post_id = data.Attributes.post_id
    let params = getPostLom(post_id);
    // let getMediaPromise = docClient.get(params).promise();
    // getMediaPromise.then((data) => (data.Item.list_of_media))
    return Promise.resolve(ddbutil.get(docClient,params))
  }).then((data) => {

    let updatedList = _.remove(data.Item.list_of_media, {
      id: media_id
    });

    if (updatedList.length > 1) {
      updatedList = updatedList.sort(function(a, b) {
        var aa = a.creation_timestamp,
          bb = b.creation_timestamp;
        //  console.log(aa);
        if (aa !== bb) {
          if (aa > bb) {
            return 1;
          }
          if (aa < bb) {
            return -1;
          }
        }
        return aa - bb;
      });
    }
    return Promise.resolve(ddbutil.update(docClient,updatePostLom(post_id,updatedList)))
  }).then(()=>{
    console.log("success");
    res.json({"status" : "success"});
  }).catch((err) => {
    console.log(err);
    res.status(404).json({
      status:'error',
      message: "Internal error"});
    });
}

exports.update_a_media = function (req,res){
  if (req.body.id)updatemedia(req,res)
  else {
  res.status(404).json({
    status:'error',
    message: "media parameter"})
  }
}


exports.create_a_media = function (req,res){
  if (req.body.post_id)createmedia(req,res)
  else {
  res.status(404).json({
    status:'error',
    message: "media id was not specified"})
  }
}

exports.delete_a_media = function (req,res){
  if (req.body.id)deletemedia(req,res)
  else {
  res.status(404).json({
    status:'error',
    message: "media id was not specified"});
  }
}

exports.show_media = function(req, res) {
     if(req.query.post_id)get_a_media(req,res)
     else{
     res.status(404).json({
       status:'error',
       message:'no post id specified'})
   }
};
