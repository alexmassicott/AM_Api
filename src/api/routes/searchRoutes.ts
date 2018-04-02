
import { authenticate } from 'passport'
import * as todoList from '../controllers/searchController'

export default function (app) {
  // todoList Routes
  app.get('/search/show.json', authenticate('jwt', { session: false }), todoList.get_search)
}
