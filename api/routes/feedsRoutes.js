'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/feedsController');

  // todoList Routes
  app.route('/feeds/show.json')
    .get(todoList.get_feed);


};
