import { Document, Schema } from 'mongoose';

export interface ObjectPermissions extends Document {

  owner?: Schema.Types.ObjectId

  private?: boolean

  canRead?: Array<Schema.Types.ObjectId>

  canWrite?: Array<Schema.Types.ObjectId>

  anonymousComments?: boolean

}