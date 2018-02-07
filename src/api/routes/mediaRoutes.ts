let multer = require('multer');
let upload = multer();
import {authenticate} from 'passport';

export default function(app) {
  var todoList = require('../controllers/mediaController');
  // todoList Routes
  app.get('/media/show.json',authenticate('jwt', { session: false }),todoList.show_media);

  app.post('/media/update.json',[upload.fields([{name:"file_data"}]),authenticate('jwt', { session: false })],todoList.update_a_media);

  app.post('/media/delete.json',authenticate('jwt', { session: false }),todoList.delete_a_media);

  app.post('/media/create.json',authenticate('jwt', { session: false }),todoList.create_a_media);
};
