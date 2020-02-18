import { Document } from 'mongoose';

export interface Account extends Document {

  name: string;

  surname: string;

  email: string;

  password: string;

  company: string;

  apitoken: string;

  logins: Array<number>;

  avatar: string;

  role: string;

  private: boolean;

  verified: boolean;

  archived: boolean;

  providerProfiles: object;

}