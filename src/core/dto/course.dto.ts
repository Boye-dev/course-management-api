import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
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

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['department', 'yearTaken']),
) {}
