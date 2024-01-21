import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateDepartmentDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'The years taken should be greater than 0' })
  yearsTaken: number;

  @ApiProperty({ required: true })
  @IsMongoId()
  @IsNotEmpty()
  school: Types.ObjectId;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @MinLength(4)
  code: string;
}

export class UpdateDepartmentDto extends PartialType(
  OmitType(CreateDepartmentDto, ['school', 'yearsTaken']),
) {}
