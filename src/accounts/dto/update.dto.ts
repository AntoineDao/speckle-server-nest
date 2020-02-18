import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, Expose, Type } from 'class-transformer';

export class AccountUpdateDto {
  
  name?: string;

  surname?: string;
  
  company?: string;
  
  email?: string;

}

export class AccountAdminUpdateDto extends AccountUpdateDto {

  @ApiProperty({ enum: ['admin', 'user'] })
  role?: string;

  archived?: boolean;

}

export class AccountUpdateResponse {

  @Expose()
  success: boolean;

  @Expose()
  message: string;

}