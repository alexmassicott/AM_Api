'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/usersController');


  // todoList Routes
  app.route('/user')
    .get(todoList.list_all_users);

  app.route('/user/create')
    .post(todoList.create_user);

    app.route('/authenticate')
      .post(todoList.authenticate);


};
