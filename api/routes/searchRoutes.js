'use strict';
let passport = require("passport");

module.exports = function(app) {
  let todoList = require('../controllers/searchController');

  // todoList Routes
  app.get('/search/show.json',passport.authenticate('jwt', { session: false }),todoList.get_search);


};
