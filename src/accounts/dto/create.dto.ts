import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAccount {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  company: string;

  name?: string;

  surname?: string;
}

export class AccountCreated {
  
  @IsEmail()
  email: string;

  apitoken: string;
  
  token: string;

}

export class CreateAccountResponse {
  
  success: boolean;

  message: string;

  resource?: AccountCreated

}