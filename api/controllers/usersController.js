'use strict';
var dynamoose = require('dynamoose'),
  User = dynamoose.model('users'),
  jwt = require('jsonwebtoken'),
  passportJWT = require("passport-jwt"),
  ExtractJwt = passportJWT.ExtractJwt,
  moment=require('moment');
  var jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  jwtOptions.secretOrKey = process.env.SECRET;
exports.list_all_users = function(req, res) {
  console.log("yo");
  User.get({username: "Amgoody"})
  .then(user=> {
    console.log("usserrr");
    res.json(user);
  })
  .catch(err=>{
    res.status(500).send(err.message);

  })
};

exports.create_user = function(req, res) {
    User.create({username: req.body.username,password:req.body.password,creation_timestamp:moment().unix()})
    .then(()=>{res.json({status:"success"})})
    .catch(err=>{ res.status(500).send(err.message);})


}

exports.authenticate = function(req, res) {
  if(req.body.username && req.body.password){
   var username = req.body.username;
   var password = req.body.password;
 }
 // usually this would be a database call:
 User.get({username:username}).then(user=>{
 if( ! user ){
   res.status(401).json({message:"no such user found"});
 }

 if(user.password === req.body.password) {
   // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
   var payload = {user: user.username, role: user.role};
   var token = jwt.sign(payload, jwtOptions.secretOrKey);
   res.json({message: "ok", token: token});
 } else {
   res.status(401).json({message:"passwords did not match"});
 }

});
}
