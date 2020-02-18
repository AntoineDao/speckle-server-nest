import merge from 'lodash';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, Expose, Type, plainToClassFromExist } from 'class-transformer';
import { SpeckleObject } from '../interfaces/speckleObject.interface'
import { SpeckleObjectDto } from './speckleObject.dto'

export class CreateObjectDto {

  @ApiPropertyOptional()
  private: boolean = false;

  @ApiPropertyOptional()
  canRead: Array<String> = [];

  @ApiPropertyOptional()
  canWrite: Array<String> = [];

  @ApiPropertyOptional()
  anonymousComments: boolean = false;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  name: string = null;

  @ApiPropertyOptional()
  geometryHash: string = null;

  @ApiPropertyOptional()
  hash: string = null;

  @ApiPropertyOptional()
  applicationId: string = null;

  @ApiProperty()
  properties: Object;

  @ApiPropertyOptional()
  partOf: Array<string> = [];

  @ApiPropertyOptional()
  parent: String = null;

  @ApiPropertyOptional()
  children: Array<String> = [];

  @ApiPropertyOptional()
  ancestor: Array<String> = [];
}


export class SavedObjectDto {

  constructor(partial: Partial<any>) {
    if (partial._doc) {
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  _id: string

  @Transform((value) => 'Placeholder', { toPlainOnly: true })
  @Expose()
  type: string = 'Placeholder'
}

export class CreateObjectsResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Saved Objects to database';

  @Expose()
  resources?: SavedObjectDto[]

}