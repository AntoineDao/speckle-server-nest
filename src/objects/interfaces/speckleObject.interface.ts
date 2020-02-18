import { Document, Schema } from 'mongoose';

export interface SpeckleObject extends Document {
  
  owner: Schema.Types.ObjectId
  
  private: boolean
  
  canRead: Array<Schema.Types.ObjectId>
  
  canWrite: Array<Schema.Types.ObjectId>
  
  anonymousComments: boolean
  
  comments: Array<Schema.Types.ObjectId>
  
  type: string
  
  name?: string
  
  geometryHash: string
  
  hash: string
  
  applicationId?: string
  
  properties: Object
  
  deleted: boolean
  
  partOf: Array<string>
  
  parent: Schema.Types.ObjectId
  
  children: Array<Schema.Types.ObjectId>
  
  ancestor: Array<Schema.Types.ObjectId>
}

export interface SpeckleObjectToSave {

  _id?: string

  owner?: string

  private?: boolean

  canRead: Array<String>

  canWrite: Array<String>

  anonymousComments?: boolean

  type: string

  name?: string

  geometryHash?: string

  hash?: string

  applicationId?: string

  properties?: Object

  partOf?: Array<string>

  parent?: String

  children: Array<String>

  ancestor: Array<String>
}

export interface HashAndID extends Document {

  hash: string
}

export interface SearchID {

  _id: string

}