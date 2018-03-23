import { dynamoose } from '../config/database'

export interface ITag extends dynamoose.ModelConstructor<any, any, any> {
	name: string
	visible: boolean
}
