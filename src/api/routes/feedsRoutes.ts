'use strict';
import {authenticate} from 'passport';
import * as todoList from '../controllers/feedsController';

export default function(app) {

  // todoList Routes
  app.get('/feeds/show.json', authenticate('jwt', { session: false }),todoList.get_feed);


};
