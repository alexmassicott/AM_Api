'use strict';
let dynamoose = require('dynamoose');
let Tags = dynamoose.model('Tags');

//////////////
function deletetag(req,res){
  Tags.delete({name:req.body.name}).then(()=>{
    res.json({ "status" : "success" , "name" : req.body.name })})
    .catch((err)=>{
      console.log(err);
      res.status(500).send({
        status: 'error',
        message: "There was a error"
      })
    });
}

function createtag(req,res){

    Tags.create(tagobj).then(()=>{
      res.json({ "status" : "success" , "name" : req.body.name })})
      .catch((err)=>{
        console.log(err);
        res.status(500).send({
          status: 'error',
          message: "There was a error"
        })
      });

}

function gettags(req,res){

  Tags.scan().attributes(["name"]).exec()
  .then((items)=>{
    res.json({ "status":"success", "data" : { "tags" : items }});
  }).catch((err)=>{
    console.log(err);
    res.status(500).send({
      status: 'error',
      message: "There was a error"
    })
  });
}

exports.delete_a_tag = function(req, res) {
  if(!req.user.role==="admin"){
    res.status(500).send({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  if (req.body.name)deletetag(req, res);
  else {
    res.status(500).send({
      status: 'error',
      message: 'no name specified'
    })
  }
};

exports.create_tag = function(req, res) {
  if(!req.user.role==="admin"){
    res.status(500).send({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  if (req.body.name)createtag(req, res);
  else {
    res.status(500).json({
      status: 'error',
      message: 'no name specified'
    })
  }
};

exports.get_tags = function(req, res) {
  if(!req.user.role==="admin"){
    res.status(500).send({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  gettags(req, res);
};
