import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import { Account } from '../interfaces/account.interface';

export class AccountDto {
  
  constructor(partial: Partial<any>) {
    if(partial._doc){
      Object.assign(this, partial._doc)
    } else {
      Object.assign(this, partial);
    }
  }

  @Transform((value) => value.toString(), { toPlainOnly: true })
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  surname: string;

  @IsEmail()
  @Expose()
  email: string;

  // @Exclude()
  // password: string;

  @Expose()
  company: string;

  @Expose()
  apitoken: string;

  @Expose()
  logins: Array<number>;

  @Expose()
  avatar: string;

  @Expose()
  role: string;

  @Expose()
  private: boolean;

  @Expose()
  verified: boolean;

  @Expose()
  archived: boolean;

  @Expose()
  providerProfiles: object;

}

export class AccountPublicDto {

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

  @Expose()
  name: string;

  @Expose()
  surname: string;

  @Expose()
  company: string;

  @Expose()
  archived: string;

}

export class LoginDto {

  email: string;

  password: string;

}

export class AccountSearchDto {

  @Length(3)
  searchString: string;

}

export class AccountListDto {
  
  @Expose()
  success: boolean;

  @Expose()
  message?: string;

  @Expose()
  resources: Array<AccountDto>
}

export class PublicAccountList {

  @Expose()
  success: boolean;

  @Expose()
  message?: string;

  @Expose()
  resources: Array<AccountPublicDto>
}

export class AccountGetOneDto {

  @Expose()
  success: boolean;

  @Expose()
  message?: string;

  @Expose()
  // @Type(() => AccountPublicDto)
  resource?: AccountPublicDto


}