let AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
let s3 = new AWS.S3();
let moment = require('moment');
let uuid=require('uuid4');
let async = require('async');
let _ = require('lodash');
let gm = require('gm').subClass({
  imageMagick: true
});
let tinify = require("tinify");
tinify.key = process.env.TINIFY_KEY;
const {updateOriginalData,getFullMedia,updateCropData,getPostLom} = require("../utils/mediautils");
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
          updateOriginalData(req, res, "complete", metadata)
          .then(()=>{res.json({status:"sucesss"})})
          .catch(err=>{
            res.status(500).send({
            status:'error',
            message: err.message});})
        });
      });

};


function cropmedia(req,res){

    let post_id;
    let cropdata;
    console.log("crop life");
    imageName = req.body.id;

      getFullMedia(req.body.id)
      .then(data=>{
        console.log(data.list_of_media);
        let mo = data.list_of_media.filter(function(a){return a.id==req.body.id});
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
      res.status(500).json({
        status:'error',
        message: err.message})
    });
    var _sizeArray = [req.body.crop_ratio];
    const cropImage = () => {

      async.forEachOf(_sizeArray, function(value, key, cb) {
        console.log(value);
        async.waterfall([
          function download(next) {
            console.time("downloadImage");
            s3.getObject({
              Bucket: srcBucket,
              Key: srcKey
            }, next);
            console.timeEnd("downloadImage");
          },
          function processImage(response, next) {
            console.time("processImage");

            let cropdataparse=req.body.crop_data.split(",");

            let x = parseInt(cropdataparse[0]);
            let y = parseInt(cropdataparse[1]);
            let width = parseInt(cropdataparse[2]);
            let height = parseInt(cropdataparse[3]);
            gm(response.Body, imageName + "." + filetype).crop(width, height, x, y).toBuffer(
              filetype.toUpperCase(),
              function(err,buffer) {
                if (err)return next(err);

                tinify.fromBuffer(buffer).toBuffer(function(err, resultData) {
                  if (err) next(err);

                  gm(resultData).filesize(function(err, filesize) {
                    if(err)next(err);
                    var bytesize = filesize.split("B");
                    var _filesize = Math.floor(parseInt(bytesize[0]) / 1000) + "kb";

                    cropdata = {
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
                    console.timeEnd("processImage");
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
          if (err) {
            console.log(err);
            res.status(500).send({
              status:'error',
              message: err.message});
          }
          else{
          console.log("End of step " + value);
          cb();
        }
        });
      }, (err, result) => {
        if (err) {
           console.log(err);
           res.status(500).send({
             status:'error',
             message: err.message});
        }

        updateCropData(req.body.id, req.body.crop_ratio, cropdata,docClient)
        .then(()=>{
          console.log("success");
          res.json({
            "status": "success"
          });
        },err=>{throw err})
        .catch(err=>{
          console.log(err);
          res.status(500).send({
            status:'error',
            message: err})
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

     getPostLom(pid)
     .then((data)=>{
       let list_of_media=data.list_of_media;
       list_of_media.push(mediaobj);
       return Promise.resolve(Posts.update({id:pid},{list_of_media:list_of_media}))
     })
     .then((data) => {
     return Promise.resolve(Media.create(mediaobj));
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

    getFullMedia(id)
    .then((data)=>{
      let list_of_media=data.list_of_media;
      let mo = list_of_media.filter(function(a){return a.id==id})[0];

      res.json({
        "status": "success",
        "data": {
          "media": [mo]
        }});

  }).catch((err) => {
    console.log(err);
    res.status(500).send({
      status: 'error',
      message: err.message
    });
  });
}

function get_medialist(req,res){
  console.log("in list");
  let post_id = req.query.post_id;

  getPostLom(post_id).then((data) => {

    let sortedArray = data.list_of_media;
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
    res.status(500).send({
      status: 'error',
      message: err.message
    });
  });
}

function deletemedia(req,res){
  let post_id=req.body.post_id;
  let updatedList;
  let media_id = req.body.id;

  getPostLom(post_id)
  .then((data) => {

      let updatedList = _.remove(data.list_of_media, {
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
      return Promise.resolve(Posts.update({list_of_media:updatedList}))
    }).then(()=>{
      Promise.resolve(Media.delete({id:media_id}))
    })
    .then(()=>{
      ///To do, delete images in media object from S3 bucket
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
