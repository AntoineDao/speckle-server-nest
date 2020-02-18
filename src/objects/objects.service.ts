import * as crypto from 'crypto';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {JwtPayload} from '../auth/interfaces/jwt.interface';
import { SpeckleObject, SpeckleObjectToSave, HashAndID, SearchID } from './interfaces/speckleObject.interface'

@Injectable()
export class ObjectsService {
  constructor(
    private readonly authService: AuthService,

    @InjectModel('SpeckleObjects') private readonly objectModel: Model<SpeckleObject>,

  ) { }

  async findById(id: String, user: JwtPayload): Promise<SpeckleObject> {
    const resource = await this.objectModel.findOne({ _id: id });

    if (!resource || !this.authService.canRead(user, resource)) {
      return Promise.reject(`Cannot find Speckle Object with ID: ${id}`)
    }

    return resource;
  }

  async findListByIds(ids: SearchID[], user: JwtPayload): Promise<SpeckleObject[]> {
    const resources = await this.objectModel.find({ _id: { $in: ids.map(obj => obj._id) } });

    return resources.filter(res => !this.authService.canRead(user, res));
  }

  async bulkFindByHash(objects: SpeckleObjectToSave[], user: JwtPayload): Promise<HashAndID[]> {
    const resources = await this.objectModel.find({ hash: { $in: objects.map(obj => obj.hash) } }, '_id hash');

    return resources.filter(res => !this.authService.canRead(user, res));
  }

  async bulkSave(objects: Array<SpeckleObjectToSave>, user: JwtPayload): Promise<SpeckleObject[]> {

    // Filter out placeholders from the save operation
    objects = objects.filter(obj => obj.type !== 'Placeholder')

    if(objects.length === 0) {
      return Promise.resolve([])
    }

    // Add user as owner and Compute object hash if not specified
    objects.forEach(obj => {

      obj.owner = user._id;
      
      if(!obj.hash) {
        obj.hash = crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
      }
    })

    const existingObjects = await this.bulkFindByHash(objects, user)
    const existingObjectIds = existingObjects.map(obj => obj.id);

    let toCreate = objects.filter(obj => !existingObjectIds.includes(obj._id))

    return this.objectModel.insertMany(toCreate)
  }


  async update(id: String, update: SpeckleObjectToSave, user: JwtPayload): Promise<any> {
    let resource;

    try {
      resource = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }
    
    if (!this.authService.canWrite(user, resource)) {
      return Promise.reject(`Cannot write to Speckle Object with ID: ${id}`)
    }

    return resource.set(update).save()
  }


  async updateProperties(id: String, update: Object, user: JwtPayload): Promise<any> {
    let resource;

    try {
      resource = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.canWrite(user, resource)) {
      return Promise.reject(`Cannot write to Speckle Object with ID: ${id}`)
    }

    _.assign(resource.properties, update)
    resource.markModified('properties')
    return resource.save()
  }


  async delete(id: String, user: JwtPayload): Promise<any> {
    let resource;

    try {
      resource = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    if (!this.authService.isOwner(user, resource)) {
      return Promise.reject(`Cannot delete Speckle Object with ID: ${id}`)
    }

    return resource.remove()
  }

  async deleteMany(objects: Array<SpeckleObject>, user: JwtPayload): Promise<any> {
    const toDelete = objects.filter(obj => this.authService.isOwner(user, obj));

    return this.objectModel.deleteMany(
      { _id: { $in: toDelete.map(obj => obj.id) }}
      )
  }

}
