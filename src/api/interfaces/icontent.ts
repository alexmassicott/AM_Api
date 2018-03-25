import { Document } from "mongoose";

export interface IContent extends Document {
	feed: string
	posts: Array<string>
	edit_timestamp: number
}
