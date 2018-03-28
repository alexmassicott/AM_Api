import { s3 } from '../config/s3'
import { Posts } from '../models/Posts'
import { IPostMedia } from '../interfaces/ipostmedia'
import { Media } from '../models/MediaObjects'
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
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

export function updateVideoData (req) {
  const mp4FileName = `${req.body.id}.mp4`

  const format = ffmpeg(req.files.file_data[0].buffer)
    .toFormat('mp4')
    .output(mp4FileName)
    .on('end', () => {
      // Provide `ReadableStream` of new video as `Body` for `pubObject`
      const params = {
        Body: fs.createReadStream(flvFileName),
        Bucket: dstBucket,
        Key: flvFileName
      }

      s3.putObject(params, (err, data) => {})
    })
}
