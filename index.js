  var express = require('express'),
  dynamoose=require('dynamoose'),
  cors = require('cors'),
  https = require('https'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser'),
  jwt = require('express-jwt'),
  jwks = require('jwks-rsa'),
  jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: "https://alexandermassicott.auth0.com/.well-known/jwks.json"
      }),
      audience: 'https://api.alexandermassicott.com',
      issuer: "https://alexandermassicott.auth0.com/",
      algorithms: ['RS256']
  });
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(jwtCheck);

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


app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({status:"error",message:'invalid token...'});
  }
});

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});


app.listen(port);

console.log('API server started on: ' + port);
