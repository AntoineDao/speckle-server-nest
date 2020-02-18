import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import { SavedObjectDto } from '../../objects/dto/create.dto'

export class StreamDto {

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
  comments?: Array<String>

  @Expose()
  name: string

  @Expose()
  description: string

  @Expose()
  commitMessage: string

  @Expose()
  tags: Array<String>

  @Expose()
  baseProperties: object

  @Expose()
  globalMeasures: object

  @Expose()
  isComputedResult: boolean

  @Transform((value) => value.map(v => new SavedObjectDto(v)), { toPlainOnly: true })
  @Expose()
  objects: Array<String>

  @Expose()
  layers: Array<Object>

  @Expose()
  viewerLayers: Array<Object>

  @Expose()
  onlineEditable: boolean

  @Expose()
  jobNumber: string


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

export class GetOneStreamResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resource?: StreamDto

}

export class GetListStreamResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resources?: StreamDto[]

}

export class DeleteObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string = 'Stream was deleted';

}

export class UpdateObjectResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Object updated';

}

export class CloneResponse {

  @Expose()
  success: boolean;

  @Expose()
  message?: string;

  @Expose()
  clone?: StreamDto;

  @Expose()
  parent?: StreamDto

}