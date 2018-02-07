'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const todoList = require("../controllers/postsController");
function default_1(app) {
    app.get('/posts/show.json', passport.authenticate('jwt', { session: false }), todoList.show_posts);
    app.post('/posts/update.json', passport.authenticate('jwt', { session: false }), todoList.update_a_post);
    app.post('/posts/destroy.json', passport.authenticate('jwt', { session: false }), todoList.delete_a_post);
    app.post('/posts/create.json', passport.authenticate('jwt', { session: false }), todoList.create_a_post);
}
exports.default = default_1;
;
//# sourceMappingURL=postsRoutes.js.map