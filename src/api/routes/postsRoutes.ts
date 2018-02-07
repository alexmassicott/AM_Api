'use strict';
import * as passport from 'passport';
import * as todoList from '../controllers/postsController';

export default function(app) {
  app.get('/posts/show.json',passport.authenticate('jwt', { session: false }),todoList.show_posts);

  app.post('/posts/update.json',passport.authenticate('jwt', { session: false }),todoList.update_a_post);

  app.post('/posts/destroy.json',passport.authenticate('jwt', { session: false }),todoList.delete_a_post);

  app.post('/posts/create.json',passport.authenticate('jwt', { session: false }),todoList.create_a_post);
};
