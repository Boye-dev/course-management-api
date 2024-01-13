import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class SettingDto {
  @ApiProperty({ required: false })
  registrationAllowed?: Record<string, Record<string, Date>>;
}
