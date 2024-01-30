import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsMongoIdArray } from '../validator/IsMongoIdArray';

export class CreateCourseDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'The year taken should be greater than 0' })
  yearTaken: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'The units should be greater than 0' })
  units: number;

  @ApiProperty({ required: true })
  @IsMongoId()
  @IsNotEmpty()
  department: Types.ObjectId;

  @ApiProperty({ required: true })
  @IsNumberString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  code: string;
}

export class EnrollCourseTeacherDto {
  @ApiProperty({
    type: String,

    isArray: true,
  })
  @Validate(IsMongoIdArray)
  courses: Types.ObjectId[];
}

export class EnrollCourseStudentDto {
  @ApiProperty({
    type: String,

    isArray: true,
  })
  @Validate(IsMongoIdArray)
  courses: Types.ObjectId[];

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  year: string;
}
export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['department', 'yearTaken']),
) {}

export class UpdateScoreDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Max(100, { message: 'Max score is 100' })
  @Min(-2, { message: 'Min score is -2' })
  score: number;
}
