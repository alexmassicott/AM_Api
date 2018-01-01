'use strict';

var AWS = require('aws-sdk');
AWS.config.loadFromPath("config.js");
var s3 = new AWS.S3();

var mongoose = require('mongoose'),
  Task = mongoose.model('Tasks'),
  Images = mongoose.model('Images');

exports.list_all_tasks = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.list_all_media = function(req, res) {
  console.log(req.query.id);
  if(req.query.id)read_a_media(req,res)
  else{
  Images.find({}, function(err, media) {
    if (err)
      res.send(err);
    res.json(media);
  });
}
};

function read_a_media(req,res) {
  console.log(req.query.id);

  Images.findById(req.query.id, function(err, media) {
    if (err)
      res.send(err);
    res.json(media);
  });
};

exports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  var new_media = new Images();
  new_media.save(function(err, media) {
    if (err)res.send(err);
    new_task.media=media.id;
    console.log(new_task);

  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
});
};


exports.read_a_task = function(req, res) {
  Task.findById(req.params.taskId, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};
