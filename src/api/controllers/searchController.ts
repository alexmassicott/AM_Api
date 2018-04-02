import * as _ from 'lodash'
import { Posts } from '../models/Posts'
import { IPost } from '../interfaces/ipost'
import { Tags } from '../models/Tags'
import { Response, Request } from 'express'
// ////////////
async function getsearch (req: Request): Promise<any> {
  const query: any[] = req.query.query.split(',')
  const queryItems: any[] = []
  let result: any[]
  let result2: IPost[]
  let posts: string[]

  result = await Posts.find({ list_of_tags: { $elemMatch: { name: { $in: query } } } }).populate('list_of_media')

  // done();
  return result
}

export async function get_search (req: Request, res: Response): Promise<any> {
  let result
  const query = req.query.query
  try {
    result = await getsearch(req)
    res.json({
      status: 'success',
      status_msg: '',
      data: {
        search_query: query,
        more_available: false,
        total_search_results_returned: result.length,
        list_of_search_results: result
      }
    })
  } catch (err) {
    res.json({
      status: 'success',
      status_msg: query ? '' : 'no query given',
      data: {
        search_query: query || null,
        more_available: false,
        total_search_results_returned: 0,
        list_of_search_results: []
      }
    })
  }
}
