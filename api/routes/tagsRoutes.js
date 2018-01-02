'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/tagsController');

  // todoList Routes
  app.route('/tags/show.json')
    .get(todoList.get_tags);


    app.route('/tags/create.json')
      .post(todoList.create_tag);

      app.route('/tags/delete.json')
        .post(todoList.delete_a_tag);

};
