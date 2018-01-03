  var express = require('express'),
  cors = require('cors')
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


// app.use(bodyParser.urlencoded({ extended: true }));
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

// app.use(jwtCheck);
app.get('/authorized', function (req, res) {
  res.send('Secured Resource');
});
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
