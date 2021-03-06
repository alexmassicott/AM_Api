import { s3 } from '../config/s3'
import * as async from 'async'
import * as _ from 'lodash'
import * as tinify from 'tinify'
import { Posts } from '../models/Posts'
import { IPostMedia } from '../interfaces/ipostMedia'
import { Media } from '../models/MediaObjects'
import { updateOriginalData, getFullMedia, updateCropData, getPostLom, updateVideoData } from '../utils/mediautils'
import { Response, Request } from 'express'
import { PERMISSION_ERROR } from '../constants/errorconstants'
const gm = require('gm').subClass({ imageMagick: true })
const uuid = require('uuid4')
tinify.key = process.env.TINIFY_KEY
const bucketName = 'alexmassbucket'
let pathParams,
  image,
  imageName,
  srcKey,
  typeMatch,
  filetype
const srcBucket = bucketName
const dstBucket = `${bucketName}-output`
// /////////////////////////////////////////

function cropImage (req, res, next) {
  let cropdata
  const _sizeArray = [req.body.crop_ratio]

  async.forEachOf(
    _sizeArray,
    (value, key, cb) => {
      console.log(value)
      console.log(srcKey)
      async.waterfall(
        [
          function download (next2) {
            console.time('downloadImage')
            s3.getObject(
              {
                Bucket: bucketName,
                Key: srcKey
              },
              next2
            )
            console.timeEnd('downloadImage')
          },
          function processImage (response, next2) {
            const cropdataparse = req.body.crop_data.split(',')
            const x = parseInt(cropdataparse[0])
            const y = parseInt(cropdataparse[1])
            const width = parseInt(cropdataparse[2])
            const height = parseInt(cropdataparse[3])
            gm(response.Body, `${imageName}.${filetype}`)
              .crop(width, height, x, y)
              .toBuffer(filetype.toUpperCase(), (err, buffer) => {
                if (err) {
                  console.log('errrrrrorr')
                  return next(err)
                }
                console.log('here dawg')
                tinify.fromBuffer(buffer).toBuffer((err, resultData) => {
                  if (err) next(err)

                  gm(resultData).filesize((err, filesize) => {
                    if (err) next(err)
                    const bytesize = filesize.split('B')
                    const _filesize = `${Math.floor(parseInt(bytesize[0]) / 1000)}kb`

                    cropdata = {
                      extension: filetype,
                      file_size: _filesize,
                      crop: {
                        x,
                        y,
                        width,
                        height
                      },
                      url: `${'images/' + `${imageName}` + '.'}${_sizeArray[key]}.${filetype}`,
                      status: 'processed'
                    }
                    next2(null, buffer)
                  })
                })
              })
          },
          function uploadResize (crop, next2) {
            s3.putObject(
              {
                Bucket: dstBucket,
                Key: `${'images/' + `${imageName}` + '.'}${value}.${filetype}`,
                Body: crop,
                ContentType: filetype.toUpperCase()
              },
              next2
            )
          }
        ],
        (err, result) => {
          if (err) next(err)
          else {
            console.log(`End of step ${value}`)
            cb()
          }
        }
      )
    },
    (err, result) => {
      if (err) next(err)

      try {
        updateCropData(req.body.id, req.body.crop_ratio, cropdata)
        res.json({ status: 'success' })
      } catch (err) {
        next(err)
      }
    }
  )
}

function updatemedia (req: Request, res: Response, next: any): void {
  const image = req.files.file_data[0]
  const typeMatch = req.files.file_data[0].originalname.match(/\.([^.]*)$/)
  const filetype = typeMatch[1].toLowerCase()
  const imageName = req.body.id
  const url = `${'images/' + `${imageName}` + '.'}${filetype}`
  const metadata = _.pick(req.files.file_data[0], ['originalname', 'size', 'mimetype', 'encoding'])
  metadata.url = url
  if (req.body.type == 'image' || req.body.type == 'cover_image') {
    console.log('image breh')
    const s3params = {
      Bucket: bucketName,
      Key: url,
      Body: req.files.file_data[0].buffer,
      ContentType: `image/${filetype}`
    }
    s3.putObject(s3params, async (err, data) => {
      if (err) next(err)
      try {
        const response = await updateOriginalData(req.body.id, 'complete', metadata)
        console.log('succeess')
        res.json({ status: 'success' })
      } catch (err) {
        console.log('error uploading')
        next(err)
      }
    })
  } else if (req.body.type == 'video') {
    console.log('video breh')
    updateVideoData(req, res, next)
  }
}

async function cropmedia (req: Request, res: Response, next: any): Promise<void> {
  imageName = req.body.id
  try {
    const data = await getFullMedia(req.body.id)
    if (data.original_data) {
      srcKey = data.original_data.url
      typeMatch = srcKey.match(/\.([^.]*)$/)
      filetype = typeMatch[1].toLowerCase()
      cropImage(req, res, next)
    } else throw "Couldn't find original image for media object"
  } catch (err) {
    next(err)
  }
}

async function createmedia (req: Request, res: Response, next: any): Promise<any> {
  const postid = req.body.post_id
  const timestamp = Date.now() / 1000

  try {
    const media = new Media({ post_id: postid })
    media.save()
    Posts.findById(postid)
      .select('list_of_media')
      .then((post) => {
        post.list_of_media.push(media._id)
        Promise.resolve(post.save())
      })
      .then(() => {
        res.json({
          status: 'success',
          data: {
            id: media._id
          }
        })
      })
  } catch (err) {
    next(err)
  }
}

async function get_a_media (req, res, next): Promise<void> {
  const id = req.query.id
  try {
    const mo = await getFullMedia(id)
    res.json({
      status: 'success',
      data: {
        media: [mo]
      }
    })
  } catch (err) {
    next(err)
  }
}
function get_medialist (req, res, next) {
  console.log('in list')
  const post_id = req.query.post_id

  getPostLom(post_id)
    .then((data) => {
      res.json({
        status: 'success',
        data: {
          media: data.list_of_media
        }
      })
    })
    .catch((err) => {
      next(err)
    })
}

async function deletemedia (req: Request, res: Response, next: any): Promise<any> {
  const post_id = req.body.post_id
  const media_id = req.body.id
  try {
    const data = await Posts.update({ id: post_id }, { $pullAll: { list_of_media: [media_id] } })
    Media.remove({ _id: media_id })
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
}

export const update_a_media = function (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.body.action == 'upload') updatemedia(req, res, next)
  else if (req.body.action == 'crop') cropmedia(req, res, next)
  else next(new Error('missing action parameters'))
}

export const create_a_media = function (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.body.post_id) createmedia(req, res, next)
  else next(new Error('post id or media id not specified'))
}

export const delete_a_media = function (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.body.id) deletemedia(req, res, next)
  else next(new Error('post id or media id not specified'))
}

export const show_media = function (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.query.post_id) get_medialist(req, res, next)
  else if (req.query.id) get_a_media(req, res, next)
  else next(new Error('post id or media id not specified'))
}
