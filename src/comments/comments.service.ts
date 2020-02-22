import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { ObjectsService } from 'src/objects/objects.service';
import { ProjectsService } from 'src/projects/projects.service';
import { StreamsService } from 'src/streams/streams.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { Model, Schema, Types } from 'mongoose';
import { Comment, CommentToSave, CommentToUpdate} from './interface/comment.interface'
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { CommentResource } from './interface/resource.interface';
import { ResourceType } from '@nestjs/common/interfaces/external/kafka-options.interface';

@Injectable()
export class CommentsService {
  constructor(
    private readonly authService: AuthService,
    private readonly objectService: ObjectsService,
    private readonly projectService: ProjectsService,
    private readonly streamService: StreamsService,
    private readonly accountService: AccountsService,
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
  ) { }


  async getResource(type: string, id: string, user: JwtPayload): Promise<CommentResource> {

    switch (type) {
      case 'stream':
      case 'streams':
        return this.streamService.findById(id, user);
      case 'object':
      case 'objects':
        return this.objectService.findById(id, user);
      case 'project':
      case 'projects':
        return this.projectService.findById(id, user);
      // TODO: Sort out recursive resource search for comments to find
      // parent resource that is not a comment and check permissions
      // case 'comment':
      // case 'comments':
      //   const query = await this.commentModel.aggregate([
      //     {
      //       $addFields: {
      //         _id: { $toString: "$_id" }
      //       }
      //     },
      //     {
      //       $graphlookup: {
      //       from: 'Comment',
      //       startWith: "$resource.resourceId",
      //       connectFromField: "resource.resourceId",
      //       connectToField: "_id",
      //       as: "thread"
      //       }
      //     }
      //   ])

      //   return this.findById(id, user);
      case 'user':
        return this.accountService.findById(id);
      default:
        return Promise.reject(`Unrecognised comment resource type: ${type}`)
        break
    }
  }
  
  async create(type: string, id: string, dto: CommentToSave, user: JwtPayload): Promise<Comment> {
    let resource: CommentResource;

    try {
      resource = await this.getResource(
        type,
        id,
        user)
    } catch (err) {
      return Promise.reject(err.toString())
    }

    if (!resource || !this.authService.canComment(user, resource)) {
      return Promise.reject(`Cannot comment on ${type} with ID: ${id}`)
    }

    dto.owner = user._id;
    dto.resource = {
      resourceId: id,
      resourceType: type,
    }
    const comment = new this.commentModel(dto);

    resource.comments.push(comment._id);
    resource.markModified('comments')

    await resource.save();

    return comment.save()
  }

  async findById(id: string, user: JwtPayload): Promise<Comment> {
    let comment: Comment;
    let resource: CommentResource;

    try {
      [comment, resource] = await Promise.all([
        this.commentModel.findOne({ _id: id}),
        this.getResource(
          comment.resource.resourceType,
          comment.resource.resourceId,
          user)
        ]);

    } catch (err) {
      return Promise.reject(err.toString())
    }

    if (!resource || !this.authService.canRead(user, resource)) {
      return Promise.reject(`Cannot read comments from  ${comment.resource.resourceType} with ID: ${comment.resource.resourceId}`)
    }

    return comment;
  }

  async findByAssigned(user: JwtPayload): Promise<Comment[]> {
    let comments: Comment[];

    comments = await this.commentModel.find({ assignedTo: user._id });

    const resourceFilter = await Promise.all(comments.map(async comment => {
      const resource = await this.getResource(
        comment.resource.resourceType,
        comment.resource.resourceId,
        user
      );

      return this.authService.canRead(user, resource)
    }));

    return comments.filter((_, index) => resourceFilter[index]);
  }
  
  async findByResource(type: string, id: string, user: JwtPayload): Promise<Comment[]> {
    let resource: CommentResource;
    
    try {
      resource = await this.getResource(type, id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    return this.commentModel.find({
      '_id': {
        $in: resource.comments
      }
    })
  }

  async update(id: string, dto: CommentToUpdate, user: JwtPayload): Promise<Comment> {
    let comment: Comment;

    try {
      comment = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!comment || !this.authService.isOwner(user, comment)) {
      return Promise.reject(`Cannot update comment with ID: ${comment.id}`)
    }

    return comment.update(dto)
  }

  async delete(id: string, user: JwtPayload): Promise<any> {
    let comment: Comment;
    let resource: CommentResource;

    try {
      [comment, resource] = await Promise.all([
        this.commentModel.findOne({ _id: id }),
        this.getResource(
          comment.resource.resourceType,
          comment.resource.resourceId,
          user)
      ]);

    } catch (err) {
      return Promise.reject(err.toString())
    }

    if (!resource || !this.authService.isOwner(user, resource) || !this.authService.isOwner(user, comment)) {
      return Promise.reject(`Cannot delete comments for ${comment.resource.resourceType} with ID: ${comment.resource.resourceId}`)
    }

    comment.remove()

    // Delete the comment thread
    return comment.comments.map(id => {
      this.delete(id.toString(), user);
    })
  }

}
