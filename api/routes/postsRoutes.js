'use strict';


module.exports = function(app) {
  var todoList = require('../controllers/postsController');

  // todoList Routes
  app.route('/posts/show.json')
    .get(todoList.show_posts);

  app.route('/posts/update.json')
      .post(todoList.update_a_post);

  app.route('/posts/delete.json')
      .post(todoList.delete_a_post);

  app.route('/posts/create.json')
        .post(todoList.create_a_post);
};
