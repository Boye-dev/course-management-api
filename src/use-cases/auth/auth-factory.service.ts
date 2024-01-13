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
@Injectable()
export class AuthFactoryService {
  constructor(
    private dataService: IDataServices,
    private jwtService: JwtService,
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
    const payload = {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id,
    };

    const accessToken = await this.generateJwtToken(payload);

    const refreshToken = await this.generateJwtToken(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(user: User & { _id: Types.ObjectId }) {
    const payload = {
      email: user.email,
      role: user.role,
      firstname: user.firstName,
      lastName: user.lastName,
      id: user._id,
    };
    const accessToken = await this.generateJwtToken(payload);

    return { accessToken };
  }
}
