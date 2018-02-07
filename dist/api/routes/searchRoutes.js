'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = require("passport");
const todoList = require("../controllers/searchController");
function default_1(app) {
    // todoList Routes
    app.get('/search/show.json', passport_1.authenticate('jwt', { session: false }), todoList.get_search);
}
exports.default = default_1;
;
//# sourceMappingURL=searchRoutes.js.map