import {s3} from '../config/s3'
import * as async from 'async'
import * as _ from 'lodash'
import * as tinify from 'tinify'
import {IPostMedia,Posts} from '../models/Posts'
import {Media} from '../models/MediaObjects'
import {updateOriginalData,getFullMedia,updateCropData,getPostLom} from '../utils/mediautils'
import { Response, Request, Next } from 'express'
let gm = require('gm').subClass({
  imageMagick: true
})
let uuid=require('uuid4')

////////////////////////////////////////
tinify.key = process.env.TINIFY_KEY;
const bucketName = 'alexmassbucket';
let pathParams, image, imageName, srcKey,typeMatch,filetype;
let srcBucket = bucketName;
let dstBucket = bucketName + '-output';
///////////////////////////////////////////

function updatemedia(req: Request, res: Response, next: Next): void{

    console.log("i'm in this bitch")
    image = req.files["file_data"][0];
    typeMatch = req.files["file_data"][0].originalname.match(/\.([^.]*)$/);
    filetype = typeMatch[1].toLowerCase();
    imageName =  req.body.id;
    var url = 'images/' + `${imageName}` + "." + filetype;
    var metadata=_.pick(req.files["file_data"][0], ['originalname', 'size','mimetype','encoding']);
    metadata.url=url;

    tinify.fromBuffer(req.files["file_data"][0].buffer).toBuffer(function(err, resultData) {
        if(err)next(err)
        let s3params =  {
                Bucket: bucketName,
                Key: url,
                Body: resultData,
                ContentType: 'image/'+filetype
        };
        s3.putObject(s3params, function(err, data) {
          if (err)next(err)
          try{
            updateOriginalData(req.body.id,"complete", metadata)
            res.json({status:"success"});
          }
          catch(err){
            next(err)
          }
      });
    });
};

async function cropmedia(req: Request,res: Response, next: Next): Promise<void>{

    let post_id;
    let cropdata;
    console.log("crop life");
    imageName = req.body.id;
    try{
      const data = await getFullMedia(req.body.id)
      console.log(data.list_of_media);
      var _sizeArray = [req.body.crop_ratio];
      let mo:IPostMedia[] = data.list_of_media.filter(function(a){return a.id==req.body.id});
      if (mo[0].original_data) {
        console.log("yea boy")
        srcKey = mo[0].original_data.url;
        console.log("srcKey is" +srcKey);
        typeMatch = srcKey.match(/\.([^.]*)$/);
        filetype = typeMatch[1].toLowerCase();
        cropImage();
      }
      else throw ("Couldn't find original image for media object");
    }
    catch(err){
      next(err)
    }
    function cropImage(){

      async.forEachOf(_sizeArray, function(value, key, cb) {
        console.log(value);
        async.waterfall([
          function download(next2) {
            console.time("downloadImage");
            s3.getObject({
              Bucket: srcBucket,
              Key: srcKey
            }, next);
            console.timeEnd("downloadImage");
          },
          function processImage(response, next2) {

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
                    next2(null, buffer);
                    });
                  });
              });
          },
          function uploadResize(crop, next2) {

            s3.putObject({
              Bucket: dstBucket,
              Key: 'images/' + `${imageName}` + "." + value + "." + filetype,
              Body: crop,
              ContentType: filetype.toUpperCase()
            }, next2);
          }
        ], (err, result) => {
          if (err)next(err)
          else{
          console.log("End of step " + value);
          cb();
        }
        });
      }, (err, result) => {
        if(err)next(err)

        try{
        updateCropData(req.body.id, req.body.crop_ratio, cropdata)
        res.json({ "status": "success"});
        }
        catch(err){
          next(err)
        }
      })
    }

}

async function createmedia(req: Request, res: Response, next: Next): Promise<any>{

   const postid=req.body.post_id;
   const mediaid=uuid().replace(/-/g, '');
   const timestamp=Date.now()/1000
   const mediaobj={
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

  try{
   const data = await getPostLom(postid)
   let list_of_media=data.list_of_media;
   list_of_media.push(mediaobj);
   Posts.update({id:postid},{list_of_media:list_of_media})
   .then(() => {
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
  }
  catch(err){
    next(err)
  }
}

async function get_a_media(req,res,next): Promise<void>{

  const id = req.query.id;
  try{
  const data = await getFullMedia(id)
  const list_of_media=data.list_of_media;
  const mo:IPostMedia = list_of_media.filter(function(a){return a.id==id})[0];
  res.json({
    "status": "success",
    "data": {
      "media": [mo]
    }
  });
  }
  catch(err){
    next(err)
  }
}

function get_medialist(req, res, next){
  console.log("in list");
  let post_id = req.query.post_id;

  getPostLom(post_id).then((data) => {

    let sortedArray = data.list_of_media;
    if (sortedArray.length > 1) {
      sortedArray =  data.list_of_media.sort(function(a, b) {
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
      next(err)
  });
}

async function deletemedia(req: Request,res: Response, next: Next): Promise<any>{

  let post_id=req.body.post_id;
  let updatedList;
  let media_id = req.body.id;
  try{
    const data = await getPostLom(post_id)
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

   Posts.update({list_of_media:updatedList})
   .then(()=> Promise.resolve(Media.delete({id:media_id})))
   .then(()=>{
    res.json({"status" : "success"})
    })
  }
  catch(err){
    next(err)
  }
}

export const update_a_media = function (req: Request, res: Response, next: Next): void{
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))

  if (req.body.action=="upload")updatemedia(req, res, next)
  else if(req.body.action=="crop")cropmedia(req, res, next)
  else next(new Error("missing action parameters"))
}

export const create_a_media = function(req: Request, res: Response, next: Next): void{
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
  if(req.body.post_id)createmedia(req, res, next)
  else next(new Error("post id or media id not specified"))
}

export const delete_a_media = function (req: Request, res: Response, next: Next): void{
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
  if (req.body.id)deletemedia(req, res, next)
  else next(new Error("post id or media id not specified"))

}

export const show_media = function(req: Request, res: Response, next: Next): void{
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
   if(req.query.post_id)get_medialist(req, res, next);
   else if(req.query.id)get_a_media(req, res, next);
   else next(new Error("post id or media id not specified"))

};
