import { Document } from "mongoose";

export interface IMedia extends Document {
	id: string
	post_id: boolean
	creation_timestamp: boolean
	edit_timestamp: boolean
}
