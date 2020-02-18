import { Document, Schema } from 'mongoose';
import { CreateObjectDto } from '../../objects/dto/create.dto';

export interface ProjectPermissions  {
  canRead: Array<Schema.Types.ObjectId>

  canWrite: Array<Schema.Types.ObjectId>
}

export interface Project extends Document {

  owner: Schema.Types.ObjectId

  private: boolean

  canRead: Array<Schema.Types.ObjectId>

  canWrite: Array<Schema.Types.ObjectId>

  anonymousComments: boolean

  comments: Array<Schema.Types.ObjectId>

  name: string;

  description: string;

  tags: Array<string>;

  streams: Array<string>;

  permissions: ProjectPermissions;

  deleted: boolean;
}


export interface ProjectToSave {

  owner?: string

  private: boolean

  canRead: Array<String>

  canWrite: Array<String>

  anonymousComments: boolean

  name: string;

  description: string;

  tags: Array<String>;

  streams?: Array<String>;

  permissions: ProjectPermissions;

}

export interface ProjectToUpdate {

}


export enum Permission {
  read,
  write,
  none,
}

export interface ProjectStreams {



}


export interface listQuery {

  admin?: boolean


}