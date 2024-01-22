import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { SchoolEnum } from '../entities';
import { GenderEnum, StatusEnum } from '../interfaces/user.interfaces';
import { UserEnum } from './user.dto';

export class QueryDto {
  search?: string;
  searchBy?: string[];
  findOperation?: object;
  pageSize?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SchoolQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    type: [String],
    enum: SchoolEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(SchoolEnum, { each: true })
  searchBy?: string[];

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsEnum(SchoolEnum)
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    type: String,
    enum: ['asc', 'desc'],
    isArray: false,
    required: false,
  })
  @IsString()
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class MainQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({
    type: String,
    enum: ['asc', 'desc'],
    isArray: false,
    required: false,
  })
  @IsString()
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
export class DepartmentQueryDto extends MainQueryDto {
  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  school?: string[];

  @ApiProperty({
    type: [String],
    enum: SchoolEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(SchoolEnum, { each: true })
  searchBy?: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  yearsTaken?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsEnum(SchoolEnum)
  @IsOptional()
  sortBy?: string;
}

export class StudentQueryDto extends MainQueryDto {
  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  department?: string[];

  @ApiProperty({
    type: [String],
    enum: UserEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserEnum, { each: true })
  searchBy?: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    enum: StatusEnum,
    required: false,
  })
  @IsEnum(StatusEnum, { each: true })
  @IsOptional()
  status?: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  yearOfAdmission?: string[];

  @ApiProperty({
    type: [String],
    isArray: true,
    enum: GenderEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(GenderEnum, { each: true })
  gender?: string[];

  @ApiProperty({
    required: false,
    type: String,
    isArray: false,
    enum: UserEnum,
  })
  @IsString()
  @IsEnum(UserEnum)
  @IsOptional()
  sortBy?: string;
}

export class TeacherQueryDto extends MainQueryDto {
  @ApiProperty({
    type: [String],
    enum: UserEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserEnum, { each: true })
  searchBy?: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  department?: string[];

  @ApiProperty({
    type: String,
    isArray: true,
    enum: StatusEnum,
    required: false,
  })
  @IsEnum(StatusEnum, { each: true })
  @IsOptional()
  status?: string[];

  @ApiProperty({
    type: [String],
    isArray: true,
    enum: GenderEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(GenderEnum, { each: true })
  gender?: string[];

  @ApiProperty({
    required: false,
    type: String,
    isArray: false,
    enum: UserEnum,
  })
  @IsString()
  @IsEnum(UserEnum)
  @IsOptional()
  sortBy?: string;
}
