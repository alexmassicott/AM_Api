'use strict';
import { create_user, authenticate, list_all_users } from '../controllers/usersController';

export default function(app) {
  console.log('applying');
  app.route('/user')
    .get(list_all_users);

  app.route('/user/create')
    .post(create_user);

    app.route('/authenticate')
      .post(authenticate);
};
