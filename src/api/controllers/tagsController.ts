'use strict';
import { Tags } from '../models/Tags';
import { Response, Request } from 'express';

function deletetag(req:Request ,res:Response, next: any): void{
  Tags.delete({name:req.body.name})
  .then(()=>{
    res.json({ "status" : "success" , "name" : req.body.name })})
  .catch((err)=>{
    next(new Error("tag doesn't exist"))
  });
}

function createtag(req:Request, res:Response, next: any): void{
  let name=req.body.name;
  Tags.create({name: name})
  .then(()=>{
    res.json({ "status" : "success" , "name" : req.body.name })})
    .catch((err)=>{
      next(err)
    });
}

function gettags(req:Request, res:Response, next: any): void{
  Tags.scan().attributes(["name"]).exec()
  .then((items)=>{
    res.json({ "status":"success", "data" : { "tags" : items }});
  }).catch((err)=>{
      next(err)
  });
}

export function delete_a_tag(req:Request, res:Response, next: any): void {
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
  if (req.body.name)deletetag(req, res, next);
  else next(new Error("no name parameter specified"))

};

export function create_tag(req:Request, res:Response, next: any): void{
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
  if (req.body.name)createtag(req, res, next);
  else next(new Error("no name parameter specified"))

};

export function get_tags(req:Request, res:Response, next: any) {
  if(req.user.role!=="admin")next(new Error("you don't have the admissions to perform this task"))
  gettags(req, res, next);
};
