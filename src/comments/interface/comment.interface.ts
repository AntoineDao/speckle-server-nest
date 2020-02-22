import { Document, Schema } from 'mongoose';

export interface Resource {

  resourceType: string

  resourceId: string

}

export interface Comment extends Document { 
  owner: Schema.Types.ObjectId
  // threads
  comments: Array<Schema.Types.ObjectId>

  // content
  text: string

  // you know, moderation!
  flagged: boolean

  // parent resource
  resource: Resource

  // other resources this comment may be attached to
  otherResources: Array<Resource>

  // minimal issue-like functionality
  closed: boolean
  assignedTo: Schema.Types.ObjectId
  labels: Array<string>
  priority: string
  status: string

  // camera view (can be expanded to hold other scene settings)
  view: Object

  // screenshot
  screenshot: string

}


export interface CommentToSave {
  owner?: string

  // content
  text: string

  // parent resource
  resource?: Resource

  // other resources this comment may be attached to
  otherResources?: Array<Resource>

  // minimal issue-like functionality
  closed?: boolean
  assignedTo: string
  labels: Array<string>
  priority: string
  status: string

  // camera view (can be expanded to hold other scene settings)
  view: Object

  // screenshot
  screenshot: string
}

export interface CommentToUpdate {
  // content
  text: string

  // other resources this comment may be attached to
  otherResources?: Array<Resource>

  // minimal issue-like functionality
  closed: boolean
  assignedTo: string
  labels: Array<string>
  priority: string
  status: string

  // camera view (can be expanded to hold other scene settings)
  view: Object

  // screenshot
  screenshot: string
}
