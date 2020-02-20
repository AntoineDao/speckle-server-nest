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

import { AuthService } from 'src/auth/auth.service';

import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

import { ProjectDto, GetOneProjectResponse, GetListProjectResponse, DeleteProjectResponse, UpdateProjectResponse } from './dto/project.dto'
import { CreateProjectDto } from './dto/create.dto'

import { ProjectsService } from './projects.service';
import { GetListObjectResponse, SpeckleObjectDto } from 'src/objects/dto/speckleObject.dto';
import { GetListClientResponse, ClientDto } from 'src/clients/dto/client.dto';

@ApiTags('Projects')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectsService,
    private readonly authService: AuthService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateProjectDto, @Request() req): Promise<GetOneProjectResponse> {
    const user = req.user as JwtPayload;
    let res = new GetOneProjectResponse()

    try {
      const newProject = await this.projectService.create(dto, user)

      res.resource = new ProjectDto(newProject)
    } catch (err) {
      res.success = false;
      res.message = err.toString();
    }

    return res;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async get(@Request() req): Promise<GetListProjectResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListProjectResponse()

    try {
      const projects = await this.projectService.getList({}, user)
      res.resources = projects.map(project => new ProjectDto(project));
    } catch (err) {
      res.success = false;
      res.message = err.toString()
    }

    return res
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getAdmin(@Request() req): Promise<GetListProjectResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListProjectResponse()

    try {
      const projects = await this.projectService.getList({admin: true}, user)
      res.resources = projects.map(project => new ProjectDto(project));
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
  async getById(@Param() param, @Request() req): Promise<GetOneProjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetOneProjectResponse();

    try {
      const project = await this.projectService.findById(id, user)

      res.resource = new ProjectDto(project);
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
  async updateProject(@Param() param, @Body() dto: CreateProjectDto, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.update(id, dto, user)
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
  async deleteProject(@Param() param, @Request() req): Promise<DeleteProjectResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new DeleteProjectResponse();

    try {
      await this.projectService.delete(id, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/addstream/:streamId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'streamId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async addStream(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, streamId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.addStream(id, streamId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/removestream/:streamId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'streamId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async removeStream(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, streamId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.removeStream(id, streamId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/adduser/:userId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'userId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async addUser(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, userId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.addUser(id, userId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/removeuser/:userId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'userId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async removeUser(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, userId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.removeUser(id, userId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }


  @Put(':id/upgradeuser/:userId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'userId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async upgradeUser(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, userId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.upgradeUser(id, userId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Put(':id/downgradeuser/:userId')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'userId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async downgradeUser(@Param() param, @Request() req): Promise<UpdateProjectResponse> {
    const user = req.user as JwtPayload;
    const { id, userId } = param;
    let res = new UpdateProjectResponse();

    try {
      await this.projectService.downgradeUser(id, userId, user)
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

}
