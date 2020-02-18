import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateClientDto {

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
  role: string;

  @ApiProperty()
  documentName: string;

  @ApiProperty()
  documentGuid: string;

  @ApiProperty()
  documentType: string;

  @ApiProperty()
  documentLocation: string;

  @ApiProperty()
  streamId: string;

  @ApiProperty()
  online: boolean;

}