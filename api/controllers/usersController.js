'use strict';

var dynamoose = require('dynamoose'),
  User = dynamoose.model('users'),
  moment=require('moment');

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



}
