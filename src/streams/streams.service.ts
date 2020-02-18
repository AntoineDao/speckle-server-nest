import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import * as q2m from 'query-to-mongo';

import { ObjectsService } from 'src/objects/objects.service';
import { ClientsService } from 'src/clients/clients.service';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { SpeckleObject, SpeckleObjectToSave } from 'src/objects/interfaces/speckleObject.interface';
import { Client } from 'src/clients/interfaces/client';
import { Stream, StreamToSave, CloneOperation, listQuery } from './interfaces/stream';
import { Diff } from './interfaces/diff';


@Injectable()
export class StreamsService {
  constructor(
    private readonly authService: AuthService,
    private readonly objectService: ObjectsService,
    private readonly clientService: ClientsService,
    @InjectModel('DataStream') private readonly streamModel: Model<Stream>,
  ) {}

  async create(dto: StreamToSave, objects: Array<SpeckleObjectToSave>, user: JwtPayload): Promise<Stream> {
    
    let savedObjects: Array<SpeckleObject>

    try {
      savedObjects = await this.objectService.bulkSave(objects, user);
    } catch (err) {
      return Promise.reject(err)
    }
    
    dto.owner = user._id;
    dto.streamId = shortid();
    dto.objects = savedObjects.map(obj => obj.id)
    
    const stream = new this.streamModel(dto);

    try {
      return stream.save();
    } catch (err) {
      // TODO: there might be some problems not catching this promise...
      await this.objectService.deleteMany(savedObjects, user)
      return Promise.reject(err)
    }
  }

  async findById(id: string, user: JwtPayload): Promise<Stream> {
    const resource = await this.streamModel.findOne({ streamId: id });

    if (!resource || !this.authService.canRead(user, resource)) {
      return Promise.reject(`Cannot find Stream with ID: ${id}`)
    }

    return resource;
  }

  async getList(query: listQuery, user: JwtPayload): Promise<Stream[]> {
    const userSelect = '_id name surname email company'

    // prepare query
    let finalCriteria = {
      $and: [],
      $or: [],
    }


    if (query._ids) {
      query._ids.forEach(id => {
        finalCriteria.$or.push({ 'streamId': id })
      })
    }

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

    return this.streamModel.find(finalCriteria, query.fields)
      .populate({ path: 'canRead', select: userSelect })
      .populate({ path: 'canWrite', select: userSelect })

  }

  async update(id: string, dto: StreamToSave, objects: Array<SpeckleObjectToSave>, user: JwtPayload): Promise<any> {
    let resource: Stream;
    let savedObjects: Array<SpeckleObject>

    try {
      resource = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, resource)) {
      return Promise.reject(`Cannot write to Stream: ${id}`)
    }

    try {
      savedObjects = await this.objectService.bulkSave(objects, user);
    } catch (err) {
      return Promise.reject(err)
    }

    resource.set(dto)
    resource.objects = savedObjects.map(obj => obj.id)
    // Not sure what this does but keeping it in for safety...
    resource.canRead = resource.canRead.filter(x => !!x)
    resource.canWrite = resource.canWrite.filter(x => !!x)

    try {
      return resource.save();
    } catch (err) {
      // TODO: there might be some problems not catching this promise...
      await this.objectService.deleteMany(savedObjects, user)
      return Promise.reject(err)
    }

  }

  // async addUser(id: string, userId: string, permission: string, user: JwtPayload): Promise<any> {
  //   const bsonId = new Schema.Types.ObjectId(userId);
  //   let resource: Stream;

  //   if (!['read', 'write'].includes(permission)) {
  //     return Promise.reject('Permission should be one of read or write');
  //   }

  //   try {
  //     resource = await this.findById(id, user);
  //   } catch (err) {
  //     return Promise.reject(err)
  //   }

  //   if (!this.authService.canWrite(user, resource)) {
  //     return Promise.reject(`Cannot write to Stream: ${id}`)
  //   }

  //   switch (permission) {
  //     case 'read':
  //       resource.canRead.includes(bsonId)? null : resource.canRead.push(bsonId)
  //       break;
  //     case 'write':
  //       resource.canWrite.includes(bsonId) ? null : resource.canWrite.push(bsonId)
  //       break;
  //     }

  //   return resource.save();

  // }

  async getObjects(id: string, user: JwtPayload): Promise<SpeckleObject[]> {
    let resource: Stream;

    try {
      resource = await this.findById(id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    const objectIds = resource.objects.map(obj => ({_id: obj.toString()}))

    return this.objectService.findListByIds(objectIds, user);
  }

  async getClients(id: string, user: JwtPayload): Promise<Client[]> {
    let resource: Stream;

    try {
      resource = await this.findById(id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    return this.clientService.getList({ streamId: resource.streamId }, user);
  }


  async clone(id: string, user: JwtPayload, name?: string): Promise<CloneOperation> {
    let parent;
    let clone;

    try {
      parent = await this.findById(id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    clone = new this.streamModel(parent)
    clone._id = Types.ObjectId()
    clone.streamId = shortid.generate()
    clone.parent = parent.streamId
    clone.children = []
    clone.name = name ? name : clone.name + ' (clone)' // consider adding v.xxx, where x is the child's number
    clone.createdAt = new Date()
    clone.updatedAt = new Date()
    clone.private = parent.private

    if (user._id.toString() !== parent.owner.toString()) {
      // new ownership
      clone.owner = user._id
      //  grant original owner read access
      clone.canRead = [parent.owner]
      // make it private
      clone.canWrite = []
    }

    parent.children.push(clone.streamId)
    clone.isNew = true

    const toSave = [parent, clone]

    await Promise.all(toSave.map(stream => stream.save()))

    return {
      parent,
      clone
    }
  }


  async diff(from: string, to: string, user: JwtPayload): Promise<Diff> {
    let first: Stream;
    let second: Stream;

    try {
      first = await this.findById(from, user);
      second = await this.findById(to, user)
    } catch (err) {
      return Promise.reject(err)
    }

    let objects = { common: null, inA: null, inB: null }
    const firstObjects = first.objects.map(o => o.toString())
    const secondObjects = second.objects.map(o => o.toString())

    objects.common = firstObjects.filter(id => secondObjects.includes(id))
    objects.inA = firstObjects.filter(id => !secondObjects.includes(id))
    objects.inB = secondObjects.filter(id => !firstObjects.includes(id))

    let layers = { common: null, inA: null, inB: null }
    layers.common = _.intersectionWith(first.layers, second.layers, (arrVal, otherVal) => arrVal.guid === otherVal.guid)
    layers.inA = _.differenceWith(first.layers, second.layers, (arrVal, otherVal) => arrVal.guid === otherVal.guid)
    layers.inB = _.differenceWith(second.layers, first.layers, (arrVal, otherVal) => arrVal.guid === otherVal.guid)

    return {
      objects,
      layers
    }

  }

  async delete(id: string, user: JwtPayload): Promise<any> {
    let resource;

    try {
      resource = await this.findById(id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.isOwner(user, resource)) {
      return Promise.reject(`Cannot delete Stream with ID: ${id}`)
    }

    this.streamModel.deleteMany({ streamId: { $in: [...resource.children, id] } })

  }

}
