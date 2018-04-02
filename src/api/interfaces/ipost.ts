import { Document } from 'mongoose'
import { IPostMedia } from './ipostMedia'

export interface IPost extends Document {
	id: string
	type: string
	creation_timestamp: number
	edit_timestamp: number
	redirect_link: string
	title: string
	summary: string
	publication_status: string
	featured: boolean
	list_of_media: IPostMedia[]
	list_of_tags: any[]
	length: number
}
