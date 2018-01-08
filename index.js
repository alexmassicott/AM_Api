var express = require('express'),
dynamoose=require('dynamoose'),
cors = require('cors'),
https = require('https'),
app = express(),
_=require('lodash'),
port = process.env.PORT || 3000,
bodyParser = require('body-parser'),
jwt = require('jsonwebtoken'),
passport = require("passport"),
passportJWT = require("passport-jwt");
ExtractJwt = passportJWT.ExtractJwt;
JwtStrategy = passportJWT.Strategy;
require('dotenv').config();
dynamoose.AWS.config.loadFromPath("config.js");
dynamoose.AWS.config.update({
  httpOptions: {
    agent: new https.Agent({
      rejectUnauthorized: true,
      keepAlive: true
    })
  }
});
dynamoose.setDefaults({
  create: false,
  waitForActive: false
});
var User = require('./api/models/User'),
Media = require('./api/models/MediaObjects'),
Tags = require('./api/models/Tags'),
Posts = require('./api/models/Posts');

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;


var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  // usually this would be a database call:
  console.log(jwt_payload);
  User.get({username: jwt_payload.user})
  .then(user=>{
  if (user) {
    next(null, _.pick(user,['username', 'role']));
  } else {
    next(null, false);
  }
});
});

passport.use(strategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var post_routes = require('./api/routes/postsRoutes'); //importing route
post_routes(app); //register the route
var media_routes = require('./api/routes/mediaRoutes'); //importing route
media_routes(app); //register the route
var feeds_routes = require('./api/routes/feedsRoutes'); //importing route
feeds_routes(app); //register the route
var search_routes = require('./api/routes/searchRoutes'); //importing route
search_routes(app); //register the route
var tag_routes = require('./api/routes/tagsRoutes'); //importing route
tag_routes(app); //register the route
var user_routes = require('./api/routes/userRoutes'); //importing route
user_routes(app); //register the route

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});


app.listen(port);

console.log('API server started on: ' + port);
