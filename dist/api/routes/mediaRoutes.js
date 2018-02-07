"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let multer = require('multer');
let upload = multer();
const passport_1 = require("passport");
function default_1(app) {
    var todoList = require('../controllers/mediaController');
    // todoList Routes
    app.get('/media/show.json', passport_1.authenticate('jwt', { session: false }), todoList.show_media);
    app.post('/media/update.json', [upload.fields([{ name: "file_data" }]), passport_1.authenticate('jwt', { session: false })], todoList.update_a_media);
    app.post('/media/delete.json', passport_1.authenticate('jwt', { session: false }), todoList.delete_a_media);
    app.post('/media/create.json', passport_1.authenticate('jwt', { session: false }), todoList.create_a_media);
}
exports.default = default_1;
;
//# sourceMappingURL=mediaRoutes.js.map