import { User } from '../models/User'
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import * as passportJWT from 'passport-jwt'

let ExtractJwt = passportJWT.ExtractJwt,
  jwtOptions: any = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.SECRET

export function list_all_users (req: Request, res: Response): void {}

export function create_user (req: Request, res: Response): void {
  const user = new User({ username: req.body.username, password: req.body.password })
  user
    .save()
    .then(() => {
      res.json({ status: 'success' })
    })
    .catch((err) => {
      res.status(500).send(err.message)
    })
}

export function authenticate (req: Request, res: Response, next: any): void {
  const username = req.body.username
  const password = req.body.password
  User.findOne({ username }).then((user) => {
    if (!user) {
      next(new Error("We can't find user in our system"))
    }
    if (user.password === req.body.password) {
      const payload = { user: user.username }
      const token = jwt.sign(payload, jwtOptions.secretOrKey)
      res.json({ message: 'ok', token })
    } else {
      next(new Error('Invalid Authentification'))
    }
  })
}
