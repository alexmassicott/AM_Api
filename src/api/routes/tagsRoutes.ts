
import { authenticate } from 'passport'
import * as todoList from '../controllers/tagsController'

export default function (app) {
  app.get('/tags/show.json', authenticate('jwt', { session: false }), todoList.get_tags)

  app.post('/tags/create.json', authenticate('jwt', { session: false }), todoList.create_tag)

  app.post('/tags/delete.json', authenticate('jwt', { session: false }), todoList.delete_a_tag)
}
