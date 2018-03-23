import { dynamoose } from '../config/database'

export interface IContent extends dynamoose.ModelConstructor<any, any, any> {
	feed: string
	posts: Array<string>
	edit_timestamp: number
}
