import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import { SavedObjectDto } from '../../objects/dto/create.dto'

export class ClientDto {

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
  role: string;

  @Expose()
  documentName: string;

  @Expose()
  documentGuid: string;

  @Expose()
  documentType: string;

  @Expose()
  documentLocation: string;

  @Expose()
  streamId: string;

  @Expose()
  online: boolean;

}

export class GetOneClientResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resource?: ClientDto

}

export class GetListClientResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  resources?: ClientDto[]

}

export class DeleteClienttResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string = 'Client was deleted';

}

export class UpdateClienttResponse {

  @Expose()
  success: boolean = true;

  @Expose()
  message: string = 'Client updated';

}