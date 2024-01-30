import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IDataServices, User } from 'src/core';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { StatusEnum } from 'src/core/interfaces/user.interfaces';
import { HelperService } from 'src/frameworks/helper-services/helper/helper.service';

import { MailService } from 'src/frameworks/mail/mail.service';
@Injectable()
export class AuthFactoryService {
  constructor(
    private dataService: IDataServices,
    private jwtService: JwtService,
    private helperService: HelperService,
    private mailService: MailService,
  ) {}
  async generateJwtToken(user: Partial<User>, options = {}): Promise<string> {
    try {
      return await this.jwtService.signAsync(user, options);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while generating token',
      );
    }
  }
  async validateUser(email: string, password: string): Promise<any> {
    const userExists = await this.dataService.users.findOne({
      email: email,
    });

    if (!userExists) {
      throw new BadRequestException(
        `User with email: ${email} does not exists`,
      );
    }

    if (!userExists.verified) {
      throw new UnauthorizedException('Please verify your email');
    }
    if (userExists.status === StatusEnum.Inactive) {
      throw new UnauthorizedException(
        'Your credentials are inactive please reach out to the admin',
      );
    }
    if (userExists && (await bcrypt.compare(password, userExists.password))) {
      const result = userExists.toJSON();
      return result;
    } else {
      throw new BadRequestException(`Password is incorrect`);
    }
  }
  async login(user: User & { _id: Types.ObjectId }) {
    const otpToken = this.helperService.generateOtpToken();
    const otpTokenExpires = new Date();
    otpTokenExpires.setMinutes(otpTokenExpires.getMinutes() + 1);
    try {
      const updatedUser = await this.dataService.users.update(user._id, {
        otpToken,
        otpTokenExpires,
      });
      await this.mailService.sendOtpEmail(user, otpToken);
      return updatedUser.toJSON();
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async verifyOtp(id: Types.ObjectId, otp: number) {
    try {
      const existingUser = await this.dataService.users.findById(id);
      if (!existingUser) {
        throw new BadRequestException(`User not found`);
      }
      if (existingUser.otpToken !== otp) {
        throw new BadRequestException('Otp token is invalid');
      }
      if (
        !existingUser.otpTokenExpires ||
        existingUser.otpTokenExpires < new Date()
      ) {
        throw new BadRequestException('Otp token has expired');
      }
      existingUser.otpToken = undefined;
      existingUser.otpTokenExpires = undefined;
      existingUser.markModified('otpToken');
      existingUser.markModified('otpTokenExpires');

      await existingUser.save();

      const payload = {
        email: existingUser.email,
        role: existingUser.role,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        id: existingUser._id,
      };
      const accessToken = await this.generateJwtToken(payload);

      const refreshToken = await this.generateJwtToken(payload, {
        expiresIn: '7d',
      });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
  async refreshToken(user: User & { id: Types.ObjectId }) {
    const payload = {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
    };
    const accessToken = await this.generateJwtToken(payload);

    return { accessToken };
  }
}
