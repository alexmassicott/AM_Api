'use strict';
let passport = require("passport");

module.exports = function(app) {
  var todoList = require('../controllers/usersController');

  app.get('/user',passport.authenticate('jwt', { session: false }),todoList.list_all_users);

  app.route('/user/create')
    .post(todoList.create_user);

    app.route('/authenticate')
      .post(todoList.authenticate);


};
