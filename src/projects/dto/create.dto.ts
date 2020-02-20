import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';



export class ProjectPermissionsDto {

  @ApiPropertyOptional()
  canRead: Array<String> = [];

  @ApiPropertyOptional()
  canWrite: Array<String> = [];

}

export class CreateProjectDto {

  constructor(partial: Partial<any>) {
    if (partial._doc) {
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @ApiPropertyOptional()
  private: boolean = true

  @ApiPropertyOptional()
  canRead: Array<String> = []

  @ApiPropertyOptional()
  canWrite: Array<String> = []

  @ApiPropertyOptional()
  anonymousComments: boolean = false

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string = 'This is a project, which basically helps you share a set a of streams with a set of users.'

  @ApiPropertyOptional()
  tags: Array<String> = []

  @ApiPropertyOptional()
  streams: Array<String> = []

  @ApiPropertyOptional()
  permissions: ProjectPermissionsDto = new ProjectPermissionsDto()

}