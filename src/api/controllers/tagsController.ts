'use strict';
import { Tags } from '../models/Tags';
import { Response, Request } from 'express';

function deletetag(req:Request ,res:Response): void{
  Tags.delete({name:req.body.name})
  .then(()=>{
    res.json({ "status" : "success" , "name" : req.body.name })})
  .catch((err)=>{
    console.log(err);
    res.status(500).send({
      status: 'error',
      message: "There was a error"
    })
  });
}

function createtag(req:Request, res:Response): void{
  let name=req.body.name;
  Tags.create({name: name})
  .then(()=>{
    res.json({ "status" : "success" , "name" : req.body.name })})
    .catch((err)=>{
      console.log(err);
      res.status(500).send({
        status: 'error',
        message: "There was a error"
      })
    });
}

function gettags(req:Request, res:Response): void{

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

export function delete_a_tag(req:Request, res:Response): void {
  if(req.user.role!=="admin"){
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

export function create_tag(req:Request, res:Response ): void {
  if(req.user.role!=="admin"){
    res.status(500).json({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  if (req.body.name)createtag(req, res);
  else{
    res.status(500).json({
      status: 'error',
      message: 'no name specified'
    })
  }
};

export function get_tags(req:Request, res:Response) {
  if(req.user.role!=="admin"){
    res.status(500).json({
      status:'error',
      message:"You don't have permissions to do this task"});
      return;
  }
  gettags(req, res);
};
