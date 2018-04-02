import { s3 } from '../config/s3'
import { Posts } from '../models/Posts'
import { IPostMedia } from '../interfaces/ipostmedia'
import { Media } from '../models/MediaObjects'
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
  const mp4FileName = `${req.body.id}.mp4`
  try {
    const params = {
      Body: req.files.file_data[0].buffer,
      Bucket: dstBucket,
      Key: `media/${mp4FileName}`
    }

    s3.putObject(params, async (err, data) => {
      if (err) throw err
      console.log('success with updateVideoData')
      const media = await getFullMedia(req.body.id)
      media.data.mp4.status = 'uploaded'
      media.type = 'video'
      media.data.mp4.url = `media/${mp4FileName}`
      media.data.mp4.size = req.files.file_data[0].size
      media.save()
      res.json({ status: 'success' })
    })
  } catch (err) {
    console.log('errror')
    console.log(err)
    next(err)
  }
}
