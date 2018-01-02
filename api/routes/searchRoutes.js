'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/searchController');

  // todoList Routes
  app.route('/search/show.json')
    .get(todoList.get_search);


};
