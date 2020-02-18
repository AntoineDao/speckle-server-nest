import { Document, Schema } from 'mongoose';
import { CreateObjectDto } from '../../objects/dto/create.dto';

export interface Client extends Document {

  owner: Schema.Types.ObjectId

  private: boolean

  canRead: Array<Schema.Types.ObjectId>

  canWrite: Array<Schema.Types.ObjectId>

  anonymousComments: boolean

  comments: Array<Schema.Types.ObjectId>

  role: string;
  
  documentName: string;
  
  documentGuid: string;
  
  documentType: string;
  
  documentLocation: string;
  
  streamId: string;
  
  online: boolean;
}


export interface ClientToSave {

  owner?: string

  private?: boolean

  canRead: Array<String>

  canWrite: Array<String>

  anonymousComments?: boolean

  role: string;

  documentName: string;

  documentGuid: string;

  documentType: string;

  documentLocation: string;

  streamId: string;

  online: boolean;

}


export interface ListQuery {
  
}