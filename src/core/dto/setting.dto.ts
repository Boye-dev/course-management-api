import { ApiProperty } from '@nestjs/swagger';

export class SettingDto {
  @ApiProperty({ required: false })
  registrationAllowed?: Record<string, Record<string, Date>>;
}
