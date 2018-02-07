'use strict';
import {dynamoose} from '../config/database';
import {User} from '../models/User';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'
import * as passportJWT from 'passport-jwt'
let ExtractJwt = passportJWT.ExtractJwt,
  moment=require('moment');
  var jwtOptions:any = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  jwtOptions.secretOrKey = process.env.SECRET;

export function list_all_users(req:Request, res:Response):void {

};

export function create_user(req:Request, res:Response):void {

    User.create({username: req.body.username,password:req.body.password,creation_timestamp:moment().unix()})
    .then(()=>{res.json({status:"success"})})
    .catch(err=>{ res.status(500).send(err.message);})

}

export function authenticate(req:Request, res:Response):void {
  let username;
  let password;

  if(req.body.username && req.body.password){
   username = req.body.username;
   password = req.body.password;
 }
   // usually this would be a database call:
   User.get({username:username})
   .then((user)=>{
   if( ! user ){
     res.status(401).json({message:"no such user found"});
   }

   if(user.password === req.body.password) {

     var payload = {user: user.username };
     var token = jwt.sign(payload, jwtOptions.secretOrKey);
     res.json({message: "ok", token: token});
   } else {
     res.status(401).json({message:"passwords did not match"});
   }
});
}
