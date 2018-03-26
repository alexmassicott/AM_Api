"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const jwt = require("jsonwebtoken");
const passportJWT = require("passport-jwt");
let ExtractJwt = passportJWT.ExtractJwt, jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;
function list_all_users(req, res) { }
exports.list_all_users = list_all_users;
function create_user(req, res) {
    const user = new User_1.User({ username: req.body.username, password: req.body.password });
    user
        .save()
        .then(() => {
        res.json({ status: 'success' });
    })
        .catch((err) => {
        res.status(500).send(err.message);
    });
}
exports.create_user = create_user;
function authenticate(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    User_1.User.findOne({ username }).then((user) => {
        if (!user) {
            next(new Error("We can't find user in our system"));
        }
        if (user.password === req.body.password) {
            const payload = { user: user.username };
            const token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ message: 'ok', token });
        }
        else {
            next(new Error('Invalid Authentification'));
        }
    });
}
exports.authenticate = authenticate;
//# sourceMappingURL=usersController.js.map