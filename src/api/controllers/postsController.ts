
import { Posts } from '../models/Posts'
import { Media } from '../models/MediaObjects'
import { Request, Response } from 'express'
import { PERMISSION_ERROR } from '../constants/errorconstants'
const setTags = require('../utils/updatetags')
const uuid = require('uuid4')

function get_a_post (req, res, next): void {
  console.log(req.query.id)
  const id = req.query.id

  Posts.get({ id })
    .then((items) => {
      const response = {
        status: 'success',
        data: {
          more_available: false,
          LastEvaluatedKey: 0,
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

  Posts.query('type')
    .eq(type)
    .descending()
    .startAt(req.query.offset)
    .limit(req.query.limit)
    .exec()
    .then((items) => {
      const response = {
        status: 'success',
        data: {
          more_available: !!items.lastKey,
          LastEvaluatedKey: items.lastKey ? items.lastKey : 0,
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

function getUpdatepostParams (body: any): any {
  const data: any = {}
  if (body.new_client) {
    data.client = body.new_client
  }
  if (body.new_title) {
    data.title = body.new_title
  }
  if (body.new_summary) {
    data.summary = body.new_summary
  }
  if (body.new_link) {
    data.link = body.new_link
  }
  if (body.redirect_link) {
    data.redirect_link = body.redirect_link
  }
  if (body.new_publication_status) {
    data.publication_status = body.new_publication_status
  }
  if (body.new_featured === true || body.new_featured === false) {
    data.featured = body.new_featured
  }
  data.edit_timestamp = Math.floor(Date.now() / 1000)
  return data
}

function createpost (req, res, next) {
  const postid = uuid().replace(/-/g, '')
  const mediaid = uuid().replace(/-/g, '')
  const timestamp = Math.floor(Date.now() / 1000)
  const mediaobj = { id: mediaid, post_id: postid }

  const full_mediaobj = {
    id: mediaid,
    post_id: postid,
    creation_timestamp: timestamp,
    edit_timestamp: timestamp,
    status: 'new',
    number_of_changes: 0,
    data: {
      '1x1': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      '1x2': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      '2x1': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      '3x2': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      '3x1': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      '16x9': {
        status: 'new',
        number_of_changes: 0,
        crop: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      }
    }
  }

  Media.create(mediaobj)
    .then(() => Promise.resolve(Posts.create({ id: postid, type: req.body.type, list_of_media: [full_mediaobj] })))
    .then(() => {
      res.json({ status: 'success', id: postid, mediaid })
    })
    .catch((err) => {
      next(err)
    })
}

function deletepost (req, res, next) {
  const post_id = req.body.id
  // To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
  Posts.delete({ id: post_id })
    .then(() => res.json({ status: 'success' }))
    .catch((err) => {
      next(err)
    })
}

export function create_a_post (req: Request, res: Response, next: any): void {
  console.log(req.body.type)
  if (req.body.type) createpost(req, res, next)
  else next(new Error('no type specified'))
}

export function update_a_post (req: Request, res: Response, next: any): void {
  if (req.user.role !== 'admin') next(new Error(PERMISSION_ERROR))

  if (req.body.id) {
    Posts.update({ id: req.body.id }, getUpdatepostParams(req.body)).then((data) => {
      let tags = []
      if (req.body.new_list_of_tags) {
        console.log('tags bro')
        tags = req.body.new_list_of_tags
        // setTags(req.body.id,tags,docClient);
      }
      res.json({
        status: 'success',
        data: {
          type: 'work'
        }
      })
    })
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
