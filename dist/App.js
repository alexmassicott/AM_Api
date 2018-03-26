"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const _ = require("lodash");
const User_1 = require("./api/models/User");
const userRoutes_1 = require("./api/routes/userRoutes");
const postsRoutes_1 = require("./api/routes/postsRoutes");
const tagsRoutes_1 = require("./api/routes/tagsRoutes");
const mediaRoutes_1 = require("./api/routes/mediaRoutes");
const feedsRoutes_1 = require("./api/routes/feedsRoutes");
const searchRoutes_1 = require("./api/routes/searchRoutes");
const apiutils_1 = require("./api/utils/apiutils");
require('dotenv').config();
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const port = process.env.PORT || 3000;
class App {
  constructor() {
    this.jwtOptions = {};
    this.express = express();
    this.init();
    this.mountRoutes();
  }
  init() {
    this.jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    this.jwtOptions.secretOrKey = process.env.SECRET;
    const strategy = new JwtStrategy(this.jwtOptions, (jwt_payload, next) => {
      // usually this would be a database call:
      User_1.User.findOne({
        username: jwt_payload.user
      }).then((user) => {
        if (user) {
          next(null, _.pick(user, ['username', 'role']));
        } else {
          next(null, false);
        }
      });
    });
    passport.use(strategy);
    this.express.use(passport.initialize());
  }
  mountRoutes() {
    this.express.use(bodyParser.urlencoded({
      extended: true
    }));
    this.express.use(bodyParser.json());
    this.express.use(cors());
    userRoutes_1.default(this.express);
    postsRoutes_1.default(this.express);
    feedsRoutes_1.default(this.express);
    searchRoutes_1.default(this.express);
    mediaRoutes_1.default(this.express);
    tagsRoutes_1.default(this.express);
    this.express.use((req, res) => {
      res.status(404).send({
        url: `${req.originalUrl} not found`
      });
    });
    this.express.use(apiutils_1.clientErrorHandler);
    this.express.use(apiutils_1.errorHandler);
  }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map