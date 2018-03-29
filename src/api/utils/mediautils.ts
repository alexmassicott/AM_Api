import { s3 } from '../config/s3'
import { Posts } from '../models/Posts'
import { IPostMedia } from '../interfaces/ipostmedia'
import { Media } from '../models/MediaObjects'
const fs = require('fs')
const FluentFfmpeg = require('fluent-ffmpeg')
const ffmpeg = require('@ffmpeg-installer/ffmpeg')
const streamifier = require('streamifier')
FluentFfmpeg.setFfmpegPath(ffmpeg.path)
const dstBucket = 'alexmassbucket-output'
export async function getPostLom (post_id): Promise<any> {
  const lom = await Posts.findById(post_id)
    .select('list_of_media')
    .populate('list_of_media')
  return lom
}

export async function getFullMedia (media_id: string): Promise<IPostMedia> {
  const data = await Media.findById(media_id)
  return data
}

export async function updateCropData (_id: string, _size: any, _cd: any): Promise<any> {
  const media = await getFullMedia(_id)

  media.data[_size] = _cd
  media.edit_timestamp = Date.now() / 1000
  media.number_of_changes += 1
  media.save()
}

export async function updateOriginalData (_id: string, _status: string, file: any): Promise<any> {
  const media = await getFullMedia(_id)

  media.original_data = file
  media.status = _status
  media.number_of_changes += 1
  media.edit_timestamp = Date.now() / 1000
  media.save()
}

export async function updateVideoData (req, res, next) {
  console.log(req.files)
  const mp4FileName = `/media/${req.body.id}.mp4`
  try {
    const inStream = streamifier.createReadStream(req.files.file_data[0].buffer)

    const command = FluentFfmpeg(inStream)
    command
      .toFormat('mp4')
      .saveToFile(`./protected/${mp4FileName}`)
      .on('end', () => {
        console.log('ended converting')
        // Provide `ReadableStream` of new video as `Body` for `pubObject`
        const params = {
          Body: fs.createReadStream(`./protected/${mp4FileName}`),
          Bucket: dstBucket,
          Key: mp4FileName
        }

        s3.putObject(params, async (err, data) => {
          if (err) throw err
          console.log('success with updateVideoData')
          const media = await getFullMedia(req.body.id)
          media.data.mp4.url = mp4FileName
          media.data.mp4.size = 299
          media.save()
          res.json({ status: 'success' })
        })
      })
  } catch (err) {
    console.log('errror')
    console.log(err)
    next(err)
  }
}
