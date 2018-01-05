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

    console.log("i'm in this bitch")
    image = req.files["file_data"][0];
    typeMatch = req.files["file_data"][0].originalname.match(/\.([^.]*)$/);
    filetype = typeMatch[1].toLowerCase();
    imageName =  req.body.id;
    var url = 'images/' + `${imageName}` + "." + filetype;
    var metadata=_.pick(req.files["file_data"][0], ['originalname', 'size','mimetype','encoding']);
    metadata.url=url;

    tinify.fromBuffer(req.files["file_data"][0].buffer).toBuffer(function(err, resultData) {
        if (err) console.log(err);
        let s3params =  {
                Bucket: bucketName,
                Key: url,
                Body: resultData,
                ContentType: 'image/'+filetype
        };
        s3.putObject(s3params, function(err, data) {
          if (err) res.status(500).send({status:"error", message:"something happened with s3"});
          updateOriginalData(req, res, "complete",  docClient, metadata);

        });
      });

};


function cropmedia(req,res){


    let post_id;
    let cropdata;
    console.log("crop life");
    imageName = req.body.id;
    let params={
      TableName: "mediaobjects",
      Key: {
          "id": req.body.id
      },
      ProjectionExpression:"original_data,post_id"
    };

    ddbutil.get(docClient,params)
    .then((data) => {
      console.log("hi");

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
      // let getPostLOM=docClient.get(params).promise();
      return Promise.resolve(ddbutil.get(docClient,params))})
      .then(data=>{
        console.log(data.Item.list_of_media);
        let mo = data.Item.list_of_media.filter(function(a){return a.id==req.body.id});
        if (mo[0].original_data) {
          console.log("yea boy")
          srcKey = mo[0].original_data.url;
          console.log("srcKey is" +srcKey);

          typeMatch = srcKey.match(/\.([^.]*)$/);
          filetype = typeMatch[1].toLowerCase();
          cropImage();
        }else throw ("Couldn't find original image for media object");
      },err=>{throw err})
      .catch(function(err) {
      console.log(err);
      res.status(500).send({
        status:'error',
        message: err})
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

            console.log("cropping data x is "+req.body.crop_data[0].x);
            let cropdataparse=req.body.crop_data[1].split(",");
            let width = parseInt(cropdataparse[2]);
            let height = parseInt(cropdataparse[3]);
            let x = parseInt(cropdataparse[0]);
            let y = parseInt(cropdataparse[1]);

            gm(response.Body, imageName + "." + filetype).crop(width, height, x, y).toBuffer(
              filetype.toUpperCase(),
              function(err,buffer) {
                if (err) throw err;

                tinify.fromBuffer(buffer).toBuffer(function(err, resultData) {
                  if (err) throw err;

                  gm(resultData).filesize(function(err, filesize) {
                    if(err)throw err;
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
                    updateCropData(req.body.id, value, cropdata,docClient); //
                    next(null, buffer);
                  });
                  });

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
          if (err) throw err;
          // result now equals 'done'
          console.log("End of step " + value);
          cb();
        });
      }, (err, result) => {
        if (err) {
           console.log(err);
           res.status(500).send({
             status:'error',
             message: err})

        }
        console.log("success");
        res.json({
          "status": "success"
        });
      })
    }

}



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
       res.status(500).send({
         status:'error',
         message: "Internal Error"})
       });
}
function get_a_media(req,res){
  let id = req.query.id;
  let params = {
    TableName: "mediaobjects",
    Key: {
        "id": id
    },
    ExpressionAttributeNames: {
         "#pid": "post_id",
     },
    ProjectionExpression:"#pid"
    };

  ddbutil.get(docClient, params).then((data) => {
    let params = {
      TableName: "Posts",
      Key: {
          "id": data.Item.post_id
      },
      ExpressionAttributeNames: {
           "#n": "list_of_media",
       },
      ProjectionExpression:"#n"
    };
    // getPostLOM=docClient.get(params).promise();
    return Promise.resolve(ddbutil.get(docClient,params))
    })
    .then((data)=>{
      _lom=data.Item.list_of_media;
      let mo = _lom.filter(function(a){return a.id==id});

    res.json({
      "status": "success",
      "data": {
        "media": mo[0]
      }});

  }).catch((err) => {
    console.log(err);
    res.status(404).json({
      status: 'error',
      message: err
    });
  });
}

function get_medialist(req,res){
  console.log("in list");
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
    res.status(500).json({
      status:'error',
      message: "Internal error"});
    });
}

exports.update_a_media = function (req,res){
  console.log(req.body);
  if (req.body.action=="upload")updatemedia(req,res);
  else if(req.body.action=="crop")cropmedia(req,res)
  else {
  res.status(500).send({
    status:'error',
    message: "media parameter"})
  }
}


exports.create_a_media = function (req,res){
  if (req.body.post_id)createmedia(req,res)
  else {
  res.status(500).send({
    status:'error',
    message: "media id was not specified"})
  }
}

exports.delete_a_media = function (req,res){
  if (req.body.id)deletemedia(req,res)
  else {
  res.status(500).send({
    status:'error',
    message: "media id was not specified"});
  }
}

exports.show_media = function(req, res) {
  console.log("show media");
     if(req.query.post_id)get_medialist(req,res);
     else if(req.query.id)get_a_media(req,res);
     else{
     res.status(500).send({
       status:'error',
       message:'no post id or media id specified'})
   }
};
