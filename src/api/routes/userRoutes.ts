'use strict';
let passport = require("passport");
import {create_user,authenticate,list_all_users } from '../controllers/usersController';

export default function(app) {
  console.log('applying');
  app.get('/user',passport.authenticate('jwt', { session: false }),list_all_users);

  app.route('/user/create')
    .post(create_user);

    app.route('/authenticate')
      .post(authenticate);


};
