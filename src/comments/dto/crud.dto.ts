import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, Expose, Type } from 'class-transformer';

export class CreateCommentDto {

  constructor(partial: Partial<any>) {
    if (partial._doc) {
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @ApiProperty()
  @Expose()
  text: string

  // minimal issue-like functionality
  @ApiProperty()
  @Expose()
  @Transform((value) => value.toString(), { toPlainOnly: true })
  assignedTo: string

  @ApiProperty()
  @Expose()
  labels: Array<string>

  @ApiProperty()
  @Expose()
  priority: string

  @ApiProperty()
  @Expose()
  status: string

  // camera view (can be expanded to hold other scene settings)
  @ApiProperty()
  @Expose()
  view: Object

  // screenshot
  @ApiProperty()
  @Expose()
  screenshot: string
}


export class UpdateCommentDto extends CreateCommentDto {

  @ApiProperty()
  @Expose()
  closed: boolean

}

export class CommentDto extends UpdateCommentDto {

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  @ApiProperty()
  _id: string;

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  @ApiProperty()
  owner?: string

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  @ApiProperty()
  comments?: Array<String>

}


export class GetOneCommentResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resource?: CommentDto

}

export class GetListCommentResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resources?: CommentDto[]

}

export class DeleteCommentResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string = 'Comment was deleted';

}

export class UpdateCommentResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Comment updated';

}
