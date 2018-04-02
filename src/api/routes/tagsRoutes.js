"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = require("passport");
const todoList = require("../controllers/tagsController");
function default_1(app) {
    app.get('/tags/show.json', passport_1.authenticate('jwt', { session: false }), todoList.get_tags);
    app.post('/tags/create.json', passport_1.authenticate('jwt', { session: false }), todoList.create_tag);
    app.post('/tags/delete.json', passport_1.authenticate('jwt', { session: false }), todoList.delete_a_tag);
}
exports.default = default_1;
//# sourceMappingURL=tagsRoutes.js.map