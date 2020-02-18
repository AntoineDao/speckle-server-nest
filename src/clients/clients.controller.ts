import {
  Controller,
  Body,
  Get,
  Put,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  SerializeOptions,
  Delete
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass, plainToClassFromExist } from 'class-transformer';

import { AuthService } from 'src/auth/auth.service';

import { ClientDto, GetOneClientResponse, GetListClientResponse, UpdateClienttResponse, DeleteClienttResponse } from './dto/client.dto'
import {CreateClientDto} from './dto/create.dto'
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

import { ClientsService } from './clients.service';
import { ClientToSave } from './interfaces/client';
import { GetListObjectResponse, SpeckleObjectDto } from 'src/objects/dto/speckleObject.dto';
import { response } from 'express';

@ApiTags('Clients')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientService: ClientsService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateClientDto, @Request() req): Promise<GetOneClientResponse> {
    const user = req.user as JwtPayload;
    let res = new GetOneClientResponse()

    try {
      const newClient = await this.clientService.create(dto, user);

      res.resource = new ClientDto(newClient)
    } catch (err) {
      res.success = false;
      res.message = err.toString();
    }

    return res;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getList(@Request() req): Promise<GetListClientResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListClientResponse()

    try {
      const clients = this.clientService.getList({}, user);
      res.resources = (await clients).map(client => new ClientDto(client));
    } catch (err) {
      res.success = false;
      res.message = err.toString()
    }

    return res;
  }


  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getClientById(@Param() param, @Request() req): Promise<GetOneClientResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetOneClientResponse();

    try {
      const client = await this.clientService.findById(id, user)

      res.resource = new ClientDto(client);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }


  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateClient(@Param() param, @Body() dto: CreateClientDto,@Request() req): Promise<UpdateClienttResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateClienttResponse();

    try {
      await this.clientService.update(id, dto, user);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res;
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteClient(@Param() param, @Request() req): Promise<DeleteClienttResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new DeleteClienttResponse();

    try {
      await this.clientService.delete(id, user);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res;
  }
}
