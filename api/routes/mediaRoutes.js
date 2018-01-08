let multer = require('multer');
let upload = multer();
let passport = require("passport");

module.exports = function(app) {
  var todoList = require('../controllers/mediaController');

  // todoList Routes
  app.get('/media/show.json',passport.authenticate('jwt', { session: false }),todoList.show_media);

  app.post('/media/update.json',[upload.fields([{name:"file_data"}]),passport.authenticate('jwt', { session: false })],todoList.update_a_media);

  app.post('/media/delete.json',passport.authenticate('jwt', { session: false }),todoList.delete_a_media);

  app.post('/media/create.json',passport.authenticate('jwt', { session: false }),todoList.create_a_media);
};
