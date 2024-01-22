import { Injectable } from '@nestjs/common';
import { IDataServices, User } from 'src/core';
import { UserFactoryService } from './user-factory.service';
import {
  CreateTeacherOrStudentDto,
  CreateUserDto,
  UpdateUserDto,
} from 'src/core/dto';
import { MailService } from 'src/frameworks/mail/mail.service';
import { UpdatePasswordDto } from 'src/core/dto/auth.dto';
import { Types } from 'mongoose';
import { StudentQueryDto, TeacherQueryDto } from 'src/core/dto/query.dto';

@Injectable()
export class UserUseCases {
  constructor(
    private userFactoryService: UserFactoryService,
    private dataService: IDataServices,
    private mailService: MailService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userFactoryService.createNewUsers(
      createUserDto,
      file,
    );

    const createdUser = await this.dataService.users.create(user);

    await this.mailService.sendVerifyEmail(user, user.verificationToken);

    return createdUser;
  }

  async createTeacherOrStudent(
    createUserDto: CreateTeacherOrStudentDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userFactoryService.createTeacherOrStudent(
      createUserDto,
      file,
    );

    const createdUser = await this.dataService.users.create(user);

    await this.mailService.sendVerifyEmail(user, user.verificationToken);

    return createdUser;
  }
  async getUser(id: Types.ObjectId) {
    return await this.userFactoryService.getUser(id);
  }

  async getAllStudents(query?: StudentQueryDto) {
    return await this.userFactoryService.getAllStudents(query);
  }
  async getAllTeachers(query?: TeacherQueryDto) {
    return await this.userFactoryService.getAllTeachers(query);
  }
  async verifyUser(token: string) {
    return await this.userFactoryService.verifyUser(token);
  }

  async forgotPassword(email: string) {
    const user = await this.userFactoryService.forgotPassword(email);

    await this.mailService.sendForgotPasswordEmail(
      user,
      user.resetPasswordToken,
    );

    return user.toJSON();
  }

  async resetPassword(password: string, token: string) {
    const user = await this.userFactoryService.resetPassword(password, token);

    return user.toJSON();
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    id: Types.ObjectId,
  ) {
    const user = await this.userFactoryService.updateUser(
      updateUserDto,
      file,
      id,
    );
    console.log(user);
    return user.toJSON();
  }
  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    id: Types.ObjectId,
  ) {
    const user = await this.userFactoryService.updatePassword(
      updatePasswordDto,
      id,
    );

    return user.toJSON();
  }
}
