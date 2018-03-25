"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = require("passport");
const todoList = require("../controllers/feedsController");
function default_1(app) {
    // todoList Routes
    app.get('/feeds/show.json', passport_1.authenticate('jwt', { session: false }), todoList.get_feed);
}
exports.default = default_1;
//# sourceMappingURL=feedsRoutes.js.map