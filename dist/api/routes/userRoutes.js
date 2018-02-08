'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const usersController_1 = require("../controllers/usersController");
function default_1(app) {
    console.log('applying');
    app.route('/user')
        .get(usersController_1.list_all_users);
    app.route('/user/create')
        .post(usersController_1.create_user);
    app.route('/authenticate')
        .post(usersController_1.authenticate);
}
exports.default = default_1;
;
//# sourceMappingURL=userRoutes.js.map