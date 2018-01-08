'use strict';
var passport = require("passport");
module.exports = function(app) {
  var todoList = require('../controllers/feedsController');

  // todoList Routes
  app.get('/feeds/show.json',passport.authenticate('jwt', { session: false }),todoList.get_feed);


};
