let multer = require('multer');
let upload = multer();

module.exports = function(app) {
  var todoList = require('../controllers/mediaController');

  // todoList Routes
  app.route('/media/show.json')
    .get(todoList.show_media);

  app.post('/media/update.json',upload.fields([{name:"image"}]),todoList.update_a_media);

  app.route('/media/delete.json')
      .post(todoList.delete_a_media);

  app.route('/media/create.json')
        .post(todoList.create_a_media);
};
