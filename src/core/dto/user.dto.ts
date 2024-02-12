import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
} from 'src/core/interfaces/user.interfaces';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Validate,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsStudent } from '../validator/IsStudentOrTeacher';
import { Types } from 'mongoose';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: GenderEnum })
  @IsEnum(GenderEnum)
  @IsString()
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ enum: RelationshipStatusEnum })
  @IsEnum(RelationshipStatusEnum)
  @IsString()
  @IsNotEmpty()
  relationshipStatus: RelationshipStatusEnum;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lga: string;

  @ApiProperty({ enum: [RolesEnum.Admin] })
  @IsEnum([RolesEnum.Admin])
  @IsString()
  @IsNotEmpty()
  role: Exclude<RolesEnum, ['TEACHER', 'STUDENT']>;
}
export class CreateTeacherOrStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: GenderEnum })
  @IsEnum(GenderEnum)
  @IsString()
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ enum: RelationshipStatusEnum })
  @IsEnum(RelationshipStatusEnum)
  @IsString()
  @IsNotEmpty()
  relationshipStatus: RelationshipStatusEnum;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lga: string;

  @ApiProperty()
  @IsMongoId()
  department: Types.ObjectId;

  @ApiProperty({ required: false })
  @Validate(IsStudent)
  yearOfAdmission?: number;

  @ApiProperty({ enum: [RolesEnum.Teacher, RolesEnum.Student] })
  @IsEnum([RolesEnum.Teacher, RolesEnum.Student])
  @IsString()
  @IsNotEmpty()
  role: Exclude<RolesEnum, 'ADMIN'>;
}
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role', 'email', 'password']),
) {}

export enum UserEnum {
  firstName = 'firstName',
  lastName = 'lastName',
  middleName = 'middleName',
  email = 'email',
  yearOfAdmission = 'yearOfAdmission',
}
