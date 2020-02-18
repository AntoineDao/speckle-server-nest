import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as q2m from 'query-to-mongo';

import { Client, ClientToSave, ListQuery } from './interfaces/client';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

@Injectable()
export class ClientsService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('UserAppClient') private readonly clientModel: Model<Client>,
  ) { }

  async create(dto: ClientToSave, user: JwtPayload): Promise<Client> {
    dto.owner = user._id;
    const client = new this.clientModel(dto);

    return client.save()
  }

  async findById(id: string, user: JwtPayload): Promise<Client> {
    const resource = await this.clientModel.findOne({ _id: id });

    if (!resource || !this.authService.canRead(user, resource)) {
      return Promise.reject(`Cannot find Client with ID: ${id}`)
    }

    return resource;
  }

  async getList(query: ListQuery, user: JwtPayload): Promise<Client[]> {
    let mongoQuery = q2m(query)

    const clients = await this.clientModel.find({ owner: user._id }, mongoQuery.options.fields, { sort: mongoQuery.options.sort, skip: mongoQuery.options.skip, limit: mongoQuery.options.limit })
    
    return clients.filter(client => this.authService.canRead(user, client))
  }

  async update(id: string, dto: ClientToSave, user: JwtPayload): Promise<Client> {

    let client: Client;

    try {
      client = await this.findById(id, user);
    } catch (err) {
      return Promise.reject(err)
    }

    // Might need to check if it can write to the stream too?
    // https://github.com/speckleworks/SpeckleServer/issues/182
    if (!this.authService.canWrite(user, client)) {
      return Promise.reject(`Cannot write to client with ID: ${id}`)
    }

    client.set(dto);

    return client.save()
  }

  async delete(id: string, user: JwtPayload): Promise<any> {
    let client: Client;

    try {
      client = await this.findById(id, user)
    } catch (err) {
      return Promise.reject(err)
    }

    // Might need to check if it can write to the stream too?
    // https://github.com/speckleworks/SpeckleServer/issues/182
    if (!this.authService.isOwner(user, client)) {
      return Promise.reject(`Cannot delete Client with ID: ${id}`)
    }

    return client.remove();
  }

}
