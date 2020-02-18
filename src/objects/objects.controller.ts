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

import { ObjectsService } from './objects.service';
import { AuthService } from 'src/auth/auth.service';

import { SpeckleObjectDto, GetOneObjectResponse, GetListObjectResponse, DeleteObjectResponse } from './dto/speckleObject.dto'
import { CreateObjectDto, SavedObjectDto, CreateObjectsResponse } from './dto/create.dto'
import { UpdateObjectDto, UpdateObjectResponse } from './dto/update.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { SpeckleObject } from './interfaces/speckleObject.interface';

@ApiTags('Speckle Objects')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
@Controller('objects')
export class ObjectsController {

  constructor(
    private readonly objectService: ObjectsService,
    private readonly authService: AuthService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @ApiBody({ type: [CreateObjectDto] })
  @UseGuards(AuthGuard('jwt'))
  async saveBulk(@Body() dto: CreateObjectDto[], @Request() req): Promise<CreateObjectsResponse> {
    let res = new CreateObjectsResponse()
    
    try {
      const createdObjects = await this.objectService.bulkSave(dto, req.user)
      res.resources = createdObjects.map(obj => new SavedObjectDto(obj));
    } catch (err) {
      res.success = false;
      res.message = err.toString();
    }

    return res;
  }

  @Post('derive')
  @ApiBearerAuth()
  @ApiBody({ type: [SpeckleObjectDto] })
  @UseGuards(AuthGuard('jwt'))
  async derive(@Body() dto: SpeckleObjectDto[], @Request() req): Promise<CreateObjectsResponse> {
    const user = req.user as JwtPayload;

    let res = new CreateObjectsResponse()
    let existingObjects;

    try {
      existingObjects = await this.objectService.findListByIds(dto, user);
    } catch (err) {
      res.message = err.toString();
      res.success = false;
      return res;
    }

    let toSave = [] as Array<CreateObjectDto>

    for (let original of existingObjects) {
      if (original._id) {
        let found = dto.find(o => o._id === original._id.toString())
        let mod = plainToClass(CreateObjectDto, original, { excludeExtraneousValues: true })
        mod = plainToClassFromExist(mod, found)

        // delete hash to prepare for rehashing in bulk save
        delete mod.hash
        toSave.push(mod)
      }
    }

    try {
      const createdObjects = await this.objectService.bulkSave(toSave, req.user)
      res.resources = createdObjects.map(obj => new SavedObjectDto(obj));
    } catch (err) {
      res.success = false;
      res.message = err.toString();
    }

    return res;
  }


  @Post('getBulk')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getBulk(@Body() dto: Array<string>, @Request() req): Promise<GetListObjectResponse> {
    const user = req.user as JwtPayload;

    let res = new GetListObjectResponse();

    let resources: SpeckleObject[];

    try {
      resources = await this.objectService.findListByIds(
        dto.map(id => ({_id: id})),
        user
        );
    } catch (err) {
      res.message = err.toString();
      res.success = false;
    }

    res.resources = resources.map(obj => new SpeckleObjectDto(obj));

    return res
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getObjectById(@Param() param, @Request() req): Promise<GetOneObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetOneObjectResponse();

    try {
      const object = await this.objectService.findById(id, user)
      res.resource = new SpeckleObjectDto(object);

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
  async updateObject(@Param() param, @Body() dto: UpdateObjectDto, @Request() req): Promise<UpdateObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateObjectResponse();

    try {
      await this.objectService.update(id, dto, user);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/properties')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateObjectProperties(@Param() param, @Body() dto: Object, @Request() req): Promise<UpdateObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateObjectResponse();

    try {
      await this.objectService.updateProperties(id, dto, user);
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
  async deleteObject(@Param() param, @Request() req): Promise<DeleteObjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new DeleteObjectResponse();

    try {
      await this.objectService.delete(id, user);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }
}
