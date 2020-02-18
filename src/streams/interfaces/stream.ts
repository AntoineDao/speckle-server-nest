import { Document, Schema } from 'mongoose';
import { CreateObjectDto } from '../../objects/dto/create.dto';

export interface Stream extends Document {

  owner: Schema.Types.ObjectId

  private: boolean

  canRead: Array<Schema.Types.ObjectId>

  canWrite: Array<Schema.Types.ObjectId>

  anonymousComments: boolean

  comments: Array<Schema.Types.ObjectId>

  streamId: string;

  name: string

  description: string
  
  commitMessage: string
  
  tags: Array<String>
  
  baseProperties: object
  
  globalMeasures: object
  
  isComputedResult: boolean
  
  objects: Array<Schema.Types.ObjectId>
  
  layers: Array<Object>
  
  viewerLayers: Array<Object>

  onlineEditable: boolean

  jobNumber: string

  deleted: boolean

  parent: Schema.Types.ObjectId

  children: Array<Schema.Types.ObjectId>

  ancestor: Array<Schema.Types.ObjectId>
}

export interface CloneOperation {

  parent: Stream

  clone: Stream

}

export interface StreamToSave {

  _id?: string

  owner?: string

  private?: boolean

  canRead: Array<String>

  canWrite: Array<String>

  anonymousComments?: boolean

  streamId?: string;

  name?: string

  description?: string

  commitMessage?: string

  tags?: Array<String>

  baseProperties?: object

  globalMeasures?: object

  isComputedResult?: boolean

  objects?: Array<CreateObjectDto>

  layers?: Array<Object>

  viewerLayers?: Array<Object>

  onlineEditable?: boolean

  jobNumber?: string

  parent?: String

  children: Array<String>

  ancestor: Array<String>

}

export interface listQuery {

  populatePermissions?: boolean

  admin?: boolean
  
  _ids?: String[]

  fields?: String

}