import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Exclude, Transform, Expose, Type } from 'class-transformer';

export class SpeckleObjectDto {

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

  @Expose()
  type: string

  @Expose()
  name?: string

  @Expose()
  geometryHash?: string

  @Expose()
  hash?: string

  @Expose()
  applicationId?: string

  @Expose()
  properties?: Object

  @Expose()
  partOf?: Array<string>

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  parent?: String

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  children: Array<String>

  @Transform((value) => value.map(v => v.toString()), { toPlainOnly: true })
  @Expose()
  ancestor: Array<String>

}

export class GetOneObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resource?: SpeckleObjectDto

}

export class GetListObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resources?: SpeckleObjectDto[]

}

export class DeleteObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string = 'Object was deleted';

}