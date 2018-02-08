'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const jwt = require("jsonwebtoken");
const passportJWT = require("passport-jwt");
let ExtractJwt = passportJWT.ExtractJwt, moment = require('moment');
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;
function list_all_users(req, res) {
}
exports.list_all_users = list_all_users;
;
function create_user(req, res) {
    User_1.User.create({ username: req.body.username, password: req.body.password, creation_timestamp: moment().unix() })
        .then(() => { res.json({ status: "success" }); })
        .catch(err => { res.status(500).send(err.message); });
}
exports.create_user = create_user;
function authenticate(req, res) {
    let username;
    let password;
    if (req.body.username && req.body.password) {
        username = req.body.username;
        password = req.body.password;
    }
    // usually this would be a database call:
    User_1.User.get({ username: username })
        .then((user) => {
        if (!user) {
            res.status(401).json({ message: "no such user found" });
        }
        if (user.password === req.body.password) {
            var payload = { user: user.username };
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ message: "ok", token: token });
        }
        else {
            res.status(401).json({ message: "passwords did not match" });
        }
    });
}
exports.authenticate = authenticate;
//# sourceMappingURL=usersController.js.map