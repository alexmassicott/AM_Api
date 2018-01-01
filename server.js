  var express = require('express'),
  cors = require('cors')
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');
  var assert = require('assert');
// mongoose instance connection url connection


// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var post_routes = require('./api/routes/postsRoutes'); //importing route
post_routes(app); //register the route
var media_routes = require('./api/routes/mediaRoutes'); //importing route
media_routes(app); //register the route
var feeds_routes = require('./api/routes/feedsRoutes'); //importing route
feeds_routes(app); //register the route


app.listen(port);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});
console.log('API server started on: ' + port);
