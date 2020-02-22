import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateObjectDto, SavedObjectDto, CreateObjectsResponse } from '../../objects/dto/create.dto';
import { Expose } from 'class-transformer';

export class CreateStreamDto {

  constructor(partial: Partial<any>) {
    if (partial._doc) {
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @ApiProperty()
  private?: boolean

  @ApiProperty()
  canRead: Array<String>

  @ApiProperty()
  canWrite: Array<String>

  @ApiProperty()
  anonymousComments?: boolean

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  commitMessage: string

  @ApiProperty()
  tags: Array<String>

  @ApiProperty()
  baseProperties: object

  @ApiProperty()
  globalMeasures: object

  @ApiProperty()
  isComputedResult: boolean

  @ApiProperty()
  objects: Array<CreateObjectDto>

  @ApiProperty()
  layers: Array<Object>

  @ApiProperty()
  viewerLayers: Array<Object>

  @ApiProperty()
  onlineEditable: boolean

  @ApiProperty()
  jobNumber: string


  @ApiProperty()
  parent?: String

  @ApiProperty()
  children: Array<String>

  @ApiProperty()
  ancestor: Array<String>

}
