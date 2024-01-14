import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class LoginDto {
  @ApiProperty({ required: true })
  @IsEmail()
  username: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;
}

export class IdParamsDto {
  @IsMongoId()
  id: Types.ObjectId;
}

export class RefreshDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  refresh: string;
}

export class OtpDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  otp: number;
}
