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


import { StreamDto, GetOneStreamResponse, GetListStreamResponse, UpdateObjectResponse } from './dto/stream.dto'
import { CloneResponse, CloneRequest } from './dto/clone.dto';
import { CreateStreamDto } from './dto/create.dto'
import { DiffResponseDto } from './dto/diff.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

import { StreamsService} from './streams.service';
import { StreamToSave } from './interfaces/stream';
import { GetListObjectResponse, SpeckleObjectDto } from 'src/objects/dto/speckleObject.dto';
import { GetListClientResponse, ClientDto } from 'src/clients/dto/client.dto';

@ApiTags('Streams')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
@Controller('streams')
export class StreamsController {
  constructor(
    private readonly streamService: StreamsService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateStreamDto, @Request() req): Promise<GetOneStreamResponse> {
    const user = req.user as JwtPayload;
    let res = new GetOneStreamResponse()

    try {
      const objectsToSave = dto.objects
      let streamToSave: StreamToSave;
      let intermediate: any;

      // This is GROSS! I'll need to do better later
      dto.objects = null;
      intermediate = dto;
      streamToSave = intermediate;

      const newStream = await this.streamService.create(streamToSave, dto.objects, user);

      res.resource = new StreamDto(newStream)
    } catch (err) {
      res.success = false;
      res.message = err.toString();
    }

    return res;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async get(@Request() req): Promise<GetListStreamResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListStreamResponse()
  
    try {
      const streams = await this.streamService.getList({}, user)
      res.resources = streams.map(stream => new StreamDto(stream));
    } catch (err) { 
      res.success = false;
      res.message = err.toString()
    }

    return res
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getAdmin(@Request() req): Promise<GetListStreamResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListStreamResponse()

    try {
      const streams = await this.streamService.getList({admin: true}, user)
      res.resources = streams.map(stream => new StreamDto(stream));
    } catch (err) {
      res.success = false;
      res.message = err.toString()
    }

    return res
  }


  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getStreamById(@Param() param, @Request() req): Promise<GetOneStreamResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetOneStreamResponse();

    try {
      const stream = await this.streamService.findById(id, user)

      res.resource = new StreamDto(stream);
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
  async updateStream(@Param() param, @Body() dto: CreateStreamDto, @Request() req): Promise<UpdateObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateObjectResponse();

    try {
      const objectsToSave = dto.objects
      let streamToSave: StreamToSave;
      let intermediate: any;

      // This is GROSS! I'll need to do better later
      dto.objects = null;
      intermediate = dto;
      streamToSave = intermediate;

      await this.streamService.update(id, streamToSave, objectsToSave, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteStream(@Param() param, @Request() req): Promise<UpdateObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateObjectResponse();

    try {
      await this.streamService.delete(id, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Post(':id/clone')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async clonetream(@Param() param, @Body() dto: CloneRequest, @Request() req): Promise<CloneResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new CloneResponse();

    try {
      const response = await this.streamService.clone(id, user, dto.name)

      res.parent = new StreamDto(response.parent)
      res.clone = new StreamDto(response.clone)

    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }


  @Get(':id/diff/:otherId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'otherId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async diffStreams(@Param() param, @Request() req): Promise<DiffResponseDto> {
    const user = req.user as JwtPayload;
    const { id, otherId } = param;
    let res = new DiffResponseDto();

    try {
      const response = await this.streamService.diff(id, otherId, user);

      res.objects = response.objects;
      res.layers = response.layers;
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Get(':id/objetcs')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getStreamObjects(@Param() param, @Request() req): Promise<GetListObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetListObjectResponse();

    try {
      const objects = await this.streamService.getObjects(id, user);

      res.resources = objects.map(obj => new SpeckleObjectDto(obj));
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Get(':id/clients')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getStreamClients(@Param() param, @Request() req): Promise<GetListClientResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetListClientResponse();

    try {
      const clients = await this.streamService.getClients(id, user);

      res.resources = clients.map(client => new ClientDto(client));
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

}
