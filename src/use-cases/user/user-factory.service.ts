import { User } from '../../core/entities';
import {
  CreateTeacherOrStudentDto,
  CreateUserDto,
  UpdateUserDto,
} from '../../core/dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDataServices } from 'src/core';
import { AwsService } from 'src/frameworks/aws/aws.service';
import * as bcrypt from 'bcrypt';
import { HelperService } from 'src/frameworks/helper-services/helper/helper.service';
import { UpdatePasswordDto } from 'src/core/dto/auth.dto';
import { Types } from 'mongoose';
import {
  RegistrationStatusEnum,
  RolesEnum,
  StatusEnum,
} from 'src/core/interfaces/user.interfaces';

@Injectable()
export class UserFactoryService {
  constructor(
    private dataService: IDataServices,
    private awsService: AwsService,
    private helperService: HelperService,
  ) {}
  async createNewUsers(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ) {
    const userExists = await this.dataService.users.findOne({
      email: createUserDto.email,
    });

    if (userExists) {
      throw new BadRequestException(
        `User with email: ${createUserDto.email} already exists`,
      );
    }

    let profilePicture: string;
    if (file) {
      try {
        profilePicture = await this.awsService.uploadSingleFile(file);
      } catch (error) {
        throw new InternalServerErrorException(
          `Something went wrong while uploading the picture`,
        );
      }
    } else {
      profilePicture = 'http://www.gravatar.com/avatar/?d=mp';
    }
    createUserDto.profilePicture = profilePicture;

    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    createUserDto.password = hashedPassword;

    const newUser = new User();

    const verificationToken =
      await this.helperService.generateVerificationToken();

    newUser.verificationToken = verificationToken;
    newUser.status = StatusEnum.Inactive;

    for (const key in createUserDto) {
      newUser[key] = createUserDto[key];
    }
    return newUser;
  }

  async createTeacherOrStudent(
    createUserDto: CreateTeacherOrStudentDto,
    file: Express.Multer.File,
  ) {
    const userExists = await this.dataService.users.findOne({
      email: createUserDto.email,
    });

    if (userExists) {
      throw new BadRequestException(
        `User with email: ${createUserDto.email} already exists`,
      );
    }

    let profilePicture: string;
    if (file) {
      try {
        profilePicture = await this.awsService.uploadSingleFile(file);
      } catch (error) {
        throw new InternalServerErrorException(
          `Something went wrong while uploading the picture`,
        );
      }
    } else {
      profilePicture = 'http://www.gravatar.com/avatar/?d=mp';
    }
    createUserDto.profilePicture = profilePicture;

    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    createUserDto.password = hashedPassword;

    const newUser = new User();

    const verificationToken =
      await this.helperService.generateVerificationToken();

    newUser.verificationToken = verificationToken;
    newUser.status = StatusEnum.Inactive;

    if (createUserDto.role === RolesEnum.Student) {
      const department = await this.dataService.departments.findById(
        createUserDto.department,
      );
      if (!department) {
        throw new BadRequestException('Department Not Found');
      }

      const departmentYears = department.yearsTaken;

      const registrationStatus = {};
      for (let i = 0; i < departmentYears; i++) {
        registrationStatus[
          `${Number(createUserDto.yearOfAdmission) + i}-${
            Number(createUserDto.yearOfAdmission) + i + 1
          }`
        ] = [RegistrationStatusEnum.Not_Registered];
      }
      newUser.registrationStatus = registrationStatus;
    }
    for (const key in createUserDto) {
      newUser[key] = createUserDto[key];
    }
    return newUser;
  }

  async verifyUser(verificationToken: string) {
    const existingUser = await this.dataService.users.findOne({
      verificationToken,
    });
    if (!existingUser) {
      throw new BadRequestException(
        `User with email: ${existingUser.email} does not exists`,
      );
    }
    existingUser.verified = true;
    existingUser.status = StatusEnum.Active;
    existingUser.verificationToken = undefined;
    await existingUser.save();

    return existingUser.toJSON();
  }
  async forgotPassword(email: string) {
    const existingUser = await this.dataService.users.findOne({
      email,
    });
    if (!existingUser) {
      throw new BadRequestException(
        `User with email: ${existingUser.email} does not exists`,
      );
    }

    const resetPasswordToken =
      await this.helperService.generateVerificationToken();
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    existingUser.resetPasswordToken = resetPasswordToken;
    existingUser.resetPasswordExpires = resetPasswordExpires;

    return await existingUser.save();
  }

  async resetPassword(password: string, token: string) {
    const existingUser = await this.dataService.users.findOne({
      resetPasswordToken: token,
    });
    if (!existingUser) {
      throw new BadRequestException(`Password reset token has expired`);
    }
    if (
      !existingUser.resetPasswordExpires ||
      existingUser.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Password reset token has expired');
    }

    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(password, salt);

    existingUser.password = hashedPassword;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpires = undefined;

    return await existingUser.save();
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    id: Types.ObjectId,
  ) {
    const user = await this.dataService.users.findById(id);
    if (!user) {
      throw new BadRequestException(`User not found`);
    }

    if (file) {
      try {
        const profilePicture = await this.awsService.uploadSingleFile(file);
        updateUserDto.profilePicture = profilePicture;
      } catch (error) {
        throw new BadRequestException(
          `Something went wrong while uploading the picture`,
        );
      }
    }

    return await this.dataService.users.update(id, updateUserDto);
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    id: Types.ObjectId,
  ) {
    const user = await this.dataService.users.findById(id);
    if (!user) {
      throw new BadRequestException(`User not found`);
    }

    if (
      user &&
      (await bcrypt.compare(updatePasswordDto.oldPassword, user.password))
    ) {
      const salt = await bcrypt.genSalt(13);

      const hashedPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        salt,
      );

      return await this.dataService.users.update(id, {
        password: hashedPassword,
      });
    } else {
      throw new BadRequestException(`Old Password is incorrect`);
    }
  }

  async getUser(id: Types.ObjectId) {
    try {
      const user = await this.dataService.users.findById(id);
      return user.toJSON();
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }
}
