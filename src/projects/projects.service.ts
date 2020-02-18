import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import * as q2m from 'query-to-mongo';

import { Project, ProjectToSave, listQuery, ProjectStreams, Permission } from './interfaces/project';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { StreamsService } from '../streams/streams.service';
import { Stream } from '../streams/interfaces/stream';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly authService: AuthService,
    private readonly streamService: StreamsService,
    @InjectModel('Project') private readonly projectModel: Model<Project>,
  ) { }

  async create(dto: ProjectToSave, user: JwtPayload): Promise<Project> {
    dto.owner = user._id;
    const project = new this.projectModel(dto);

    try {
      await this.applyProjectPermissionsToStreams(project, user)
    } catch (err) {
      return Promise.reject(err);
    }
 
    return project.save()
  }

  async findById(id: string, user: JwtPayload): Promise<Project> {
    const resource = await this.projectModel.findOne({ _id: id });

    if (!resource || !this.authService.canRead(user, resource)) {
      return Promise.reject(`Cannot find Project with ID: ${id}`)
    }

    return resource;
  }

  async getList(query: listQuery, user: JwtPayload): Promise<Project[]> {
    // prepare query
    let mongoQuery = q2m(query)
    let finalCriteria = {
      $and: [],
      $or: [],
    }

    // perpare array for $and coming from url params
    // delete populate permission field if present, as it hijacks the actual query criteria
    if (mongoQuery.criteria.populatePermissions) delete mongoQuery.criteria.populatePermissions
    let andCrit = Object.keys(mongoQuery.criteria).map(key => {
      let crit = {}
      crit[key] = mongoQuery.criteria[key]
      return crit
    })

    // if we actually have any query params, include them
    if (andCrit.length !== 0) finalCriteria.$and = andCrit

    // Check admin just in case it wasn't done upstream
    if (!query.admin && this.authService.isAdmin(user)) {
      // the user query itself that gets both owned and shared with streams
      finalCriteria.$or = [
        { owner: user._id },
        { 'canWrite': Types.ObjectId(user._id) },
        { 'canRead': Types.ObjectId(user._id) },
        { 'private': false }
      ]
    }

    return this.projectModel.find(finalCriteria, mongoQuery.options.fields, { sort: mongoQuery.options.sort, skip: mongoQuery.options.skip, limit: mongoQuery.options.limit })

  }

  async update(id: string, dto: ProjectToSave, user: JwtPayload): Promise<any> {
    let resource: Project;

    try {
      resource = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, resource)) {
      return Promise.reject(`Cannot write to Project: ${id}`)
    }

    // Don't update streams during update other you have to deal with permissions...
    dto.streams = [];

    resource.set(dto)
    // Not sure what this does but keeping it in for safety...
    resource.canRead = resource.canRead.filter(x => !!x)
    resource.canWrite = resource.canWrite.filter(x => !!x)

    return resource.save();
  }


  async applyProjectPermissionsToStreams(project: Project, user: JwtPayload): Promise<Stream[]> {
    let streams: Stream[];

    try {
      streams = await this.streamService.getList({ _ids: project.streams, fields: 'canWrite canRead streamId owner' }, user)
    } catch (err) {
      return Promise.reject(err)
    }

    streams.forEach(stream => {
      project.permissions.canRead.forEach(id => {
        const projectUser = {
          _id: id.toString(),
          name: 'Placeholder',
          role: 'user',
        }

        if (!this.authService.canRead(projectUser, stream)) {
          stream.canRead.push(id)
        }
      })

      project.permissions.canWrite.forEach(id => {
        const projectUser = {
          _id: id.toString(),
          name: 'Placeholder',
          role: 'user',
        }

        if (!this.authService.canWrite(projectUser, stream)) {
          stream.canWrite.push(id)
        }
      })
    })

    return Promise.all(streams.map(stream => stream.save()))
  }


  removeProjectPermissionsFromStream(project: Project, otherProjects: Project[], stream: Stream, user: JwtPayload): void {
    const streamProjects = otherProjects.filter(p => p.streams.includes(stream.streamId));
    const projectUsers = [...project.canRead, ...project.canWrite];

    projectUsers.forEach(id => {
      let canRead = false;
      let canWrite = false;

      const projectUser = {
        _id: id.toString(),
        name: 'Placeholder',
        role: 'user',
      }

      streamProjects.forEach(proj => {

        if (this.authService.canRead(projectUser, proj)) {
          canRead = true;
        }

        if (this.authService.canWrite(projectUser, proj)) {
          canWrite = true;
        }
      })

      // Add user to stream canRead if project permssions allow it
      // and user is not already there
      if (canRead && !this.authService.canRead(projectUser, stream)) {
        stream.canRead.push(id)
      }

      // Remove user from canRead if project permissions don't allow it
      if (!canRead && this.authService.canRead(projectUser, stream)) {
        const index = stream.canRead.indexOf(id);
        if (index !== -1) {
          stream.canRead.splice(index, 1)
        }
      }

      // Add user to stream canWrite if project permssions allow it
      // and user is not already there
      if (canWrite && !this.authService.canWrite(projectUser, stream)) {
        stream.canWrite.push(id)
      }

      // Remove user from canWrite if project permissions don't allow it
      if (!canWrite && this.authService.canWrite(projectUser, stream)) {
        const index = stream.canWrite.indexOf(id);
        if (index !== -1) {
          stream.canWrite.splice(index, 1)
        }
      }

    })
  }

  async delete(id: string, user: JwtPayload): Promise<any> {
    let project: Project;
    
    try {
      project = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.isOwner(user, project)) {
      return Promise.reject(`Not Authorised to delete Project: ${id}`)
    }

    let streams: Stream[];
    let otherProjects: Project[];

    try {
      [streams, otherProjects] = await Promise.all([
        this.streamService.getList({ _ids: project.streams, fields: 'canWrite canRead streamId owner' }, user),
        this.projectModel.find({ 'streams': { $in: project.streams }, _id: { $ne: project._id } }),
      ])
    } catch (err) {
      return Promise.reject(err)
    }

    streams.forEach(stream => this.removeProjectPermissionsFromStream(project, otherProjects, stream, user))

    try {
      await Promise.all(streams.map(stream => stream.save()))
    } catch (err) {
      return Promise.reject(err)
    }


    return project.remove();
  }

  async addStream(id: string, streamId: string, user:JwtPayload): Promise<any> {
    let project: Project;
    let stream: Stream;

    try {
      [project, stream] = await Promise.all([
        this.findById(id, user), 
        this.streamService.findById(streamId, user)
      ]);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, project) || !this.authService.canWrite(user, stream)) {
      return Promise.reject('Not Authorised')
    }

    if (!project.streams.includes(streamId)) {
      project.streams.push(streamId)
    }

    try {
      await this.applyProjectPermissionsToStreams(project, user);
    } catch (err) {
      return Promise.reject(err)
    }

    return project.save();
  }

  async removeStream(id: string, streamId: string, user: JwtPayload): Promise<any> {
    let project: Project;
    let otherProjects: Project[];
    let stream: Stream;

    try {
      [project, otherProjects, stream] = await Promise.all([
        this.findById(id, user),
        this.projectModel.find({ 'streams': { $in: project.streams }, _id: { $ne: project._id } }),
        this.streamService.findById(streamId, user)
      ]);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, project) || !this.authService.canWrite(user, stream)) {
      return Promise.reject('Not Authorised')
    }

    if (project.streams.includes(streamId)) {
      let index = project.streams.indexOf(streamId)
      project.streams.splice(index, 1)
    }

    this.removeProjectPermissionsFromStream(project, otherProjects, stream, user);

    return stream.save()
  }

  setUserPermission(project: Project, userId: string, permission: Permission): void {
    const bsonId = new Schema.Types.ObjectId(userId);
    
    switch (permission) {
      case Permission.read:
        project.permissions.canRead.includes(bsonId)? null : project.permissions.canRead.push(bsonId)
        if(project.permissions.canWrite.includes(bsonId)) {
          const index = project.permissions.canWrite.indexOf(bsonId);
          project.permissions.canWrite.splice(index, 1)
        }
        break;

      case Permission.write:
        project.permissions.canRead.includes(bsonId) ? null : project.permissions.canRead.push(bsonId)
        project.permissions.canWrite.includes(bsonId) ? null : project.permissions.canWrite.push(bsonId)

        break;
    }
  }

  async addUser(id: string, userId: string, user: JwtPayload ): Promise<any> {
    const bsonId = new Schema.Types.ObjectId(userId);
    let project: Project;

    try {
      project = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, project)) {
      return Promise.reject(`Cannot write to project: ${id}`)
    }

    if (!project.canRead.includes(bsonId)) {
      project.canRead.push(bsonId)
    }

    this.setUserPermission(project, userId, Permission.read)

    try {
      await this.applyProjectPermissionsToStreams(project, user);
    } catch (err) {
      return Promise.reject(err)
    }

    return project.save()
  }

  async downgradeUser(id: string, userId: string, user: JwtPayload): Promise<any> {
    let project: Project;

    try {
      project = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, project)) {
      return Promise.reject(`Cannot write to project: ${id}`)
    }

    this.setUserPermission(project, userId, Permission.read)

    try {
      await this.applyProjectPermissionsToStreams(project, user);
    } catch (err) {
      return Promise.reject(err)
    }

    return project.save()
  }

  async upgradeUser(id: string, userId: string, user: JwtPayload): Promise<any> {
    let project: Project;

    try {
      project = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, project)) {
      return Promise.reject(`Cannot write to project: ${id}`)
    }

    this.setUserPermission(project, userId, Permission.write)

    try {
      await this.applyProjectPermissionsToStreams(project, user);
    } catch (err) {
      return Promise.reject(err)
    }

    return project.save()
  }

}
