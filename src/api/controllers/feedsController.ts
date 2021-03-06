import { Request, Response } from 'express'
import { Posts } from '../models/Posts'
import { mapOrder } from '../utils/mapOrder'
import { IPost } from '../interfaces/ipost'

function getfeeds (req: any, res: any, next: any): void {
  Posts.find({ type: { $in: req.query.feed }, publication_status: 'live' })
    .sort({ creation_timestamp: -1 })
    .populate('list_of_media')
    .exec()
    .then((posts: IPost[]) => {
      res.json({ status: 'success', data: { posts } })
    })
    .catch((err) => {
      next(err)
    })
}

export function get_feed (req: Request, res: Response, next: Function): void {
  if (Array.isArray(req.query.feed)) getfeeds(req, res, next)
  else next(new Error('No feeds supplied'))
}
