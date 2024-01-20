import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { SchoolEnum } from '../entities';

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
