import { Posts } from '../models/Posts'
import { Media } from '../models/MediaObjects'
import { Request, Response } from 'express'
import { PERMISSION_ERROR } from '../constants/errorconstants'
import { IPost } from '../interfaces/ipost'
import { IPostMedia } from '../interfaces/ipostmedia'
const setTags = require('../utils/updatetags')
const uuid = require('uuid4')

function get_a_post (req, res, next): void {
  console.log(req.query.id)
  const id = req.query.id
  Posts.findById(id)
    .populate('list_of_media')
    .then((items) => {
      const response = {
        status: 'success',
        data: {
          number_of_posts_returned: items.length,
          posts: [items]
        }
      }
      res.json(response)
    })
    .catch((err) => {
      next(err)
    })
}

function get_a_type (req, res, next): void {
  const type = req.query.type

  const query: any = Posts.find({ type })
    .sort({ creation_timestamp: -1 })
    .skip(req.query.offset)
    .limit(req.query.limit)
    .populate('list_of_media')
    .exec()

  query
    .then((items) => {
      const response = {
        status: 'success',
        data: {
          more_available: query.hasNext(),
          number_of_posts_returned: items.length,
          posts: items
        }
      }
      res.json(response)
    })
    .catch((err) => {
      next(err)
    })
}

function getUpdatepostParams (body: any, post: any): void {
  if (body.new_client) {
    post.client = body.new_client
  }
  if (body.new_title) {
    post.title = body.new_title
  }
  if (body.new_summary) {
    post.summary = body.new_summary
  }
  if (body.new_link) {
    post.link = body.new_link
  }
  if (body.redirect_link) {
    post.redirect_link = body.redirect_link
  }
  if (body.new_publication_status) {
    post.publication_status = body.new_publication_status
  }
  if (body.new_featured === true || body.new_featured === false) {
    post.featured = body.new_featured
  }
  post.edit_timestamp = Math.floor(Date.now() / 1000)
  post.save()
}

function createpost (req, res, next) {
  try {
    const newmedia: IPostMedia = new Media()
    const newpost: IPost = new Posts({ type: req.body.type, list_of_media: [newmedia._id] })
    newmedia.post_id = newpost._id
    newpost.save()
    res.json({ status: 'success', id: newpost._id, mediaid: newmedia._id })
  } catch (err) {
    next(err)
  }
}

function deletepost (req, res, next) {
  const post_id = req.body.id
  // To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
  Posts.remove({ _id: post_id })
    .then(() => res.json({ status: 'success' }))
    .catch((err) => {
      next(err)
    })
}

async function updatepost (req, res, next) {
  try {
    const post = await Posts.findById(req.body.id)
    getUpdatepostParams(req.body, post)
    //   let tags = []
    //   if (req.body.new_list_of_tags) {
    //     console.log('tags bro')
    //     tags = req.body.new_list_of_tags
    //     // setTags(req.body.id,tags,docClient);
    //   }
    res.json({
      status: 'success',
      data: {
        type: 'work'
      }
    })
  } catch (err) {
    next(err)
  }
}

export function create_a_post (req: Request, res: Response, next: any): void {
  console.log(req.body.type)
  if (req.body.type) createpost(req, res, next)
  else next(new Error('no type specified'))
}

export function update_a_post (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.body.id) {
    updatepost(req, res, next)
  } else next(new Error('no id specified'))
}

export function delete_a_post (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))
  if (req.body.id) deletepost(req, res, next)
  else next(new Error('no id specified'))
}

export function show_posts (req: Request, res: Response, next: any): void {
  if (req.query.id) get_a_post(req, res, next)
  else if (req.query.type) get_a_type(req, res, next)
  else next(new Error('no id or type parameter'))
}
