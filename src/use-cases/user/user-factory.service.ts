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
import {
  QueryDto,
  StudentQueryDto,
  TeacherQueryDto,
} from 'src/core/dto/query.dto';

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

  async verifyUser(verificationToken: string, id: Types.ObjectId) {
    const existingUser = await this.dataService.users.findOne({
      _id: id,
      verificationToken,
    });
    if (!existingUser) {
      throw new BadRequestException(`Bad verification `);
    }
    existingUser.verified = true;
    existingUser.status = StatusEnum.Active;
    existingUser.verificationToken = undefined;
    existingUser.markModified('verificationToken');
    existingUser.markModified('status');
    existingUser.markModified('verified');

    await existingUser.save();

    return existingUser.toJSON();
  }
  async forgotPassword(email: string) {
    const existingUser = await this.dataService.users.findOne({
      email,
    });
    if (!existingUser) {
      throw new BadRequestException(
        `User with email: ${email} does not exists`,
      );
    }

    const resetPasswordToken =
      await this.helperService.generateVerificationToken();
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    existingUser.resetPasswordToken = resetPasswordToken;
    existingUser.resetPasswordExpires = resetPasswordExpires;
    existingUser.markModified('resetPasswordExpires');
    existingUser.markModified('resetPasswordToken');

    return await existingUser.save();
  }

  async resetPassword(password: string, token: string, id: Types.ObjectId) {
    const existingUser = await this.dataService.users.findOne({
      _id: id,
      resetPasswordToken: token,
    });
    if (!existingUser) {
      throw new BadRequestException(`User not found`);
    }
    if (
      !existingUser.resetPasswordExpires ||
      existingUser.resetPasswordExpires < new Date()
    ) {
      existingUser.resetPasswordToken = undefined;
      existingUser.resetPasswordExpires = undefined;
      existingUser.markModified('resetPasswordExpires');
      existingUser.markModified('resetPasswordToken');
      await existingUser.save();
      throw new BadRequestException('Password reset token has expired');
    }

    const salt = await bcrypt.genSalt(13);

    const hashedPassword = await bcrypt.hash(password, salt);

    existingUser.password = hashedPassword;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpires = undefined;
    existingUser.markModified('resetPasswordExpires');
    existingUser.markModified('resetPasswordToken');
    existingUser.markModified('password');

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
      if (user.role !== RolesEnum.Admin) {
        return user.populate({
          path: 'department',
          populate: {
            path: 'school',
          },
        });
      }
      return user.toJSON();
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }
  async getAllStudents(query?: StudentQueryDto) {
    try {
      const queries: QueryDto = {
        search: query.search,
        searchBy: Array.isArray(query.searchBy)
          ? query.searchBy
          : query.searchBy && [query.searchBy],
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page && Number(query.page),
        pageSize: query.pageSize && Number(query.pageSize),
      };
      const operation = [];
      if (query.department) {
        const departMentObj = [];
        if (Array.isArray(query.department)) {
          query.department.forEach((dep) =>
            departMentObj.push({ department: dep }),
          );
        } else {
          departMentObj.push({ department: query.department });
        }

        operation.push({ $or: [...departMentObj] });
      }

      if (query.gender) {
        const genderObj = [];
        if (Array.isArray(query.gender)) {
          query.gender.forEach((gen) => genderObj.push({ gender: gen }));
        } else {
          genderObj.push({ gender: query.gender });
        }

        operation.push({ $or: [...genderObj] });
      }
      if (query.yearOfAdmission) {
        const yearObj = [];
        if (Array.isArray(query.yearOfAdmission)) {
          query.yearOfAdmission.forEach((val) => yearObj.push({ gender: val }));
        } else {
          yearObj.push({ yearOfAdmission: query.yearOfAdmission });
        }

        operation.push({ $or: [...yearObj] });
      }
      if (query.status) {
        const statusObj = [];
        if (Array.isArray(query.status)) {
          query.status.forEach((val) => statusObj.push({ status: val }));
        } else {
          statusObj.push({ status: query.status });
        }

        operation.push({ $or: [...statusObj] });
      }
      operation.push({ role: RolesEnum.Student });
      if (operation.length > 0) {
        queries.findOperation = {
          $and: operation,
        };
      }

      const students = await this.dataService.users.findAll(queries, {
        path: 'department',
        populate: {
          path: 'school',
        },
      });
      return students;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getAllTeachers(query?: TeacherQueryDto) {
    try {
      const queries: QueryDto = {
        search: query.search,
        searchBy: Array.isArray(query.searchBy)
          ? query.searchBy
          : query.searchBy && [query.searchBy],
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page && Number(query.page),
        pageSize: query.pageSize && Number(query.pageSize),
      };
      const operation = [];
      if (query.department) {
        const departMentObj = [];
        if (Array.isArray(query.department)) {
          query.department.forEach((dep) =>
            departMentObj.push({ department: dep }),
          );
        } else {
          departMentObj.push({ department: query.department });
        }

        operation.push({ $or: [...departMentObj] });
      }

      if (query.gender) {
        const genderObj = [];
        if (Array.isArray(query.gender)) {
          query.gender.forEach((gen) => genderObj.push({ gender: gen }));
        } else {
          genderObj.push({ gender: query.gender });
        }

        operation.push({ $or: [...genderObj] });
      }

      if (query.status) {
        const statusObj = [];
        if (Array.isArray(query.status)) {
          query.status.forEach((val) => statusObj.push({ status: val }));
        } else {
          statusObj.push({ status: query.status });
        }

        operation.push({ $or: [...statusObj] });
      }
      operation.push({ role: RolesEnum.Teacher });
      if (operation.length > 0) {
        queries.findOperation = {
          $and: operation,
        };
      }

      const students = await this.dataService.users.findAll(queries, {
        path: 'department',
        populate: {
          path: 'school',
        },
      });
      return students;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
