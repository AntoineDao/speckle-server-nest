import merge from 'lodash';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, Expose, Type, plainToClassFromExist } from 'class-transformer';
import { SpeckleObject } from '../interfaces/speckleObject.interface'
import { SpeckleObjectDto } from './speckleObject.dto'

export class UpdateObjectDto {

  @ApiPropertyOptional()
  private: boolean;

  @ApiPropertyOptional()
  canRead: Array<String>

  @ApiPropertyOptional()
  canWrite: Array<String>

  @ApiPropertyOptional()
  anonymousComments: boolean;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  geometryHash: string;

  @ApiPropertyOptional()
  hash: string;

  @ApiPropertyOptional()
  applicationId: string;

  @ApiProperty()
  properties: Object;

  @ApiPropertyOptional()
  partOf: Array<string>;

  @ApiPropertyOptional()
  parent: String;

  @ApiPropertyOptional()
  children: Array<String>;

  @ApiPropertyOptional()
  ancestor: Array<String>;
}

export class UpdateObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Object updated';

}