import { Injectable } from '@nestjs/common';
import { User } from 'src/core';
import { AuthFactoryService } from './auth-factory.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthUseCases {
  constructor(private authFactoryService: AuthFactoryService) {}

  async login(user: User & { _id: Types.ObjectId }) {
    return await this.authFactoryService.login(user);
  }

  async refreshToken(user: User & { _id: Types.ObjectId }) {
    return await this.authFactoryService.refreshToken(user);
  }

  async verifyOtp(id: Types.ObjectId, otp: number) {
    return await this.authFactoryService.verifyOtp(id, otp);
  }
}
