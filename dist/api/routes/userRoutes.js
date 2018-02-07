'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
let passport = require("passport");
const usersController_1 = require("../controllers/usersController");
function default_1(app) {
    console.log('applying');
    app.get('/user', passport.authenticate('jwt', { session: false }), usersController_1.list_all_users);
    app.route('/user/create')
        .post(usersController_1.create_user);
    app.route('/authenticate')
        .post(usersController_1.authenticate);
}
exports.default = default_1;
;
//# sourceMappingURL=userRoutes.js.map