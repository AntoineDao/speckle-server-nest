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

import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentDto,
  GetOneCommentResponse,
  GetListCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse
} from './dto/crud.dto';

import { CommentsService } from './comments.service';

@ApiTags('Comments')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentService: CommentsService,
  ) { }

  @Post(':resourceType/:resourceId')
  @ApiParam({ name: 'resourceType' })
  @ApiParam({ name: 'resourceId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Param() param, @Request() req, @Body() dto: CreateCommentDto): Promise<GetOneCommentResponse> {
    const user = req.user as JwtPayload;
    const { resourceType, resourceId } = param;
    let res = new GetOneCommentResponse();

    try {
      const comment = await this.commentService.create(resourceType, resourceId, dto, user);
      res.resource = new CommentDto(comment);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Get(':resourceType/:resourceId')
  @ApiParam({ name: 'resourceType' })
  @ApiParam({ name: 'resourceId' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async listForResource(@Param() param, @Request() req, @Body() dto: CreateCommentDto): Promise<GetListCommentResponse> {
    const user = req.user as JwtPayload;
    const { resourceType, resourceId } = param;
    let res = new GetListCommentResponse();

    try {
      const comments = await this.commentService.findByResource(resourceType, resourceId, user);
      res.resources = comments.map(comment => new CommentDto(comment));
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Get('assigned')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async listForUser(@Request() req): Promise<GetListCommentResponse> {
    const user = req.user as JwtPayload;
    let res = new GetListCommentResponse();

    try {
      const comments = await this.commentService.findByAssigned(user);
      res.resources = comments.map(comment => new CommentDto(comment));
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getById(@Param() param, @Request() req): Promise<GetOneCommentResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new GetOneCommentResponse();

    try {
      const comment = await this.commentService.findById(id, user);
      res.resource =  new CommentDto(comment);
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
  async update(@Param() param, @Request() req, @Body() dto: UpdateCommentDto): Promise<UpdateCommentResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new UpdateCommentResponse();

    try {
      await this.commentService.update(id, dto, user);
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
  async delete(@Param() param, @Request() req): Promise<DeleteCommentResponse> {
    const user = req.user as JwtPayload;
    const { id } = param;
    let res = new DeleteCommentResponse();

    try {
      await this.commentService.delete(id, user);
    } catch (err) {
      res.message = err.toString()
      res.success = false;
    }

    return res
  }
}
