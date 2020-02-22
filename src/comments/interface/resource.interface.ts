import { Document, Schema } from 'mongoose';

export interface CommentResource extends Document {

  owner?: Schema.Types.ObjectId

  private?: boolean

  canRead?: Array<Schema.Types.ObjectId>

  canWrite?: Array<Schema.Types.ObjectId>

  anonymousComments?: boolean

  comments?: Schema.Types.ObjectId[]

}