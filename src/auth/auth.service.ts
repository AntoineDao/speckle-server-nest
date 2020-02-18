import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from '../accounts/accounts.service';
import { JwtPayload } from './interfaces/jwt.interface';
import { ObjectPermissions } from './interfaces/permissions.interface';

import * as bcrypt from 'bcrypt-nodejs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService
  ) { }

  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err)
        }

        bcrypt.hash(password, salt, null, (err, hash) => {
          if (err) {
            return reject(err)
          }
          return resolve(hash)
        })
      })
    })
  }

  async comparePassword(plainText: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainText, hash, (err, result) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(result)
        }
      })
    })
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.accountsService.findByEmail(email);
    
    if (!user) {
      return null
    }

    const matchingPassword = await this.comparePassword(password, user.password)

    if (matchingPassword) {
      return user;
    }
    return null;
  }

  login(user: any, expiresIn: string) {
    const payload = new JwtPayload(user._id, user.name, user.role)
    return this.jwtService.sign(payload, { expiresIn: expiresIn })
  }

  isAdmin(user: JwtPayload): boolean {
    return user.role === 'admin';
  }

  isOwner(user: JwtPayload, resource: ObjectPermissions): boolean {
    return resource.owner && user._id === resource.owner.toString()
  }

  canWrite(user: JwtPayload, resource: ObjectPermissions): boolean {
    if (this.isAdmin(user) || this.isOwner(user, resource)) {
      return true
    }

    if (resource.private === false) {
      return true
    }

    if (resource.canWrite.map(id => id.toString()).includes(user._id)) {
      return true
    }

    return false
  }

  canRead(user: JwtPayload, resource: ObjectPermissions): boolean {
    if (this.canWrite(user, resource)) {
      return true
    }

    if (resource.canRead.map(id => id.toString()).includes(user._id)) {
      return true
    }

    return false
  }

  canComment(user: JwtPayload, resource: ObjectPermissions): boolean {
    if (this.canRead(user, resource)) {
      return true
    }

    

    return false
  }

}