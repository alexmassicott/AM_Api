import { Document } from "mongoose";

export interface IUser extends Document {
	username: string
	password: string
	role: string
	email: string
}
