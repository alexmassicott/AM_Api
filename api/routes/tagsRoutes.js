'use strict';
let passport = require("passport");

module.exports = function(app) {
  var todoList = require('../controllers/tagsController');

  app.get('/tags/show.json',passport.authenticate('jwt', { session: false }),todoList.get_tags);

  app.post('/tags/create.json',passport.authenticate('jwt', { session: false }),todoList.create_tag);

  app.post('/tags/delete.json',passport.authenticate('jwt', { session: false }),todoList.delete_a_tag);


};
