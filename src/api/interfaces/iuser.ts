import { dynamoose } from '../config/database'

export interface IUser extends dynamoose.ModelConstructor<any, any, any> {
	username: string
	password: string
	role: string
	email: string
}
