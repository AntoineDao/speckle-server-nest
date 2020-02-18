import { Model } from 'mongoose';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './interfaces/account.interface';
import { CreateAccount } from './dto/create.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @InjectModel('Accounts') private readonly accountModel: Model<Account>,
  ) { }

  async create(dto: CreateAccount): Promise<Account> {

    const existingUser = await this.accountModel.findOne({ 'email': dto.email })

    if (existingUser) {
      return Promise.reject(`User with email ${dto.email} already exists.`)
    }

    const userCount = await this.accountModel.countDocuments();

    // Hash password and replace in payload to be saved
    const hashedPassword = await this.authService.hashPassword(dto.password)

    dto.password = hashedPassword;

    const createdAccount = new this.accountModel(dto);

    createdAccount.apitoken = this.authService.login(createdAccount, '2y')

    if (userCount === 0) {
      createdAccount.role = 'admin'
    }

    return createdAccount.save();
  }

  async findById(id: String): Promise<Account> {
    const account = await this.accountModel.findOne({_id: id});
    
    if (!account) {
      return Promise.reject(`Account with ID does not exist: ${id}`)
    }  
    
    return account;
  }

  async findByEmail(email: String, archived?: Boolean): Promise<Account> {
    
    if (!archived) {
      archived = false;
    }

    const found = await this.accountModel.find({ email: email.toLowerCase(), archived: archived });

    if(found.length === 0) {
      return Promise.reject(`User with email not found: ${email}`)
    } else if (found.length > 1) {
      return Promise.reject(`More than one user found with email: ${email}`)
    }
    return found.pop();
  }

  async search(searchString: string): Promise<Account[]> {
    const escapeRegExp = ( string ) => string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) // $& means the whole matched string

    let conditions = [];

    conditions.push({ name: { '$regex': escapeRegExp(searchString), '$options': 'i' } })
    conditions.push({ surname: { '$regex': escapeRegExp(searchString), '$options': 'i' } })
    conditions.push({ email: { '$regex': escapeRegExp(searchString), '$options': 'i' } })

    return this.accountModel.find({ $or: conditions }).limit(10)
  }

  async findAll(): Promise<Account[]> {
    return this.accountModel.find();
  }

  async updateAccount(id: string, payload: any): Promise<Account> {
    let account;

    try {
      account = await this.findById(id);

      Object.keys(payload).forEach(key => {
        if(payload[key]) {
          account[key] = payload[key]
          account.markModified(key)
        }
      })

      await account.save()
    } catch (err) {
      return Promise.reject(err)
    }

    return account

  }
}