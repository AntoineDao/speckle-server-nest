import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import { SavedObjectDto } from '../../objects/dto/create.dto'

export class ProjectPermissionsDto {

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  canRead: Array<String>

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  canWrite: Array<String>

}

export class ProjectDto {

  constructor(partial: Partial<any>) {
    if (partial._doc) {
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  _id: string;

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  owner?: string

  @Expose()
  private?: boolean

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  canRead: Array<String>

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  canWrite: Array<String>

  @Expose()
  anonymousComments?: boolean

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  comments?: Array<String>

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  tags: Array<String>;

  @Expose()
  streams: Array<String>;

  @Expose()
  permissions: ProjectPermissionsDto;

}

export class GetOneProjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resource?: ProjectDto

}

export class GetListProjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resources?: ProjectDto[]

}

export class DeleteProjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string = 'Project was deleted';

}

export class UpdateProjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Project updated';

}