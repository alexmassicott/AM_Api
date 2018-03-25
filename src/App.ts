import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import * as jwt from 'jsonwebtoken'
import * as passport from 'passport'
import * as passportJWT from 'passport-jwt'
import * as _ from 'lodash'
import { User } from './api/models/User'
import userRoutes from './api/routes/userRoutes'
import postsRoutes from './api/routes/postsRoutes'
import tagsRoutes from './api/routes/tagsRoutes'
import mediaRoutes from './api/routes/mediaRoutes'
import feedRoutes from './api/routes/feedsRoutes'
import searchRoutes from './api/routes/searchRoutes'
import { clientErrorHandler, errorHandler } from './api/utils/apiutils'
require('dotenv').config()

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
const port = process.env.PORT || 3000

class App {
	public express
	public jwtOptions: any = {}
	constructor () {
	  this.express = express()
	  this.init()
	  this.mountRoutes()
	}

	private init (): void {
	  this.jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
	  this.jwtOptions.secretOrKey = process.env.SECRET
	  const strategy = new JwtStrategy(this.jwtOptions, ((jwt_payload, next) => {
	    // usually this would be a database call:
	    console.log(jwt_payload)
	    User.findOne({ username: jwt_payload.user }).then((user) => {
	      if (user) {
	        next(null, _.pick(user, ['username', 'role']))
	      } else {
	        next(null, false)
	      }
	    })
	  }))
	  passport.use(strategy)
	  this.express.use(passport.initialize())
	}

	private mountRoutes (): void {
	  this.express.use(bodyParser.urlencoded({ extended: true }))
	  this.express.use(bodyParser.json())
	  this.express.use(cors())
	  userRoutes(this.express)
	  postsRoutes(this.express)
	  feedRoutes(this.express)
	  searchRoutes(this.express)
	  mediaRoutes(this.express)
	  tagsRoutes(this.express)

	  this.express.use((req, res) => {
	    res.status(404).send({ url: `${req.originalUrl} not found` })
	  })
	  this.express.use(clientErrorHandler)
	  this.express.use(errorHandler)
	}
}

export default new App().express
