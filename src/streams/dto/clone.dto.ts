import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StreamDto } from './stream.dto';

export class CloneRequest {

  @ApiPropertyOptional()
  name?: string  

}

export class CloneResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  clone?: StreamDto;

  @Expose()
  parent?: StreamDto

}