import { Document } from "mongoose";

export interface IPostMedia extends Document{
	id: string
	post_id: string
	creation_timestamp: number
	edit_timestamp: number
	original_data: any
	status: string
	number_of_changes: number
	data: any
}
