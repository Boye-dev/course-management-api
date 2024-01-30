import { Injectable } from '@nestjs/common';
import { SettingFactoryService } from './setting-factory.service';
import { Types } from 'mongoose';
import { SettingDto } from 'src/core/dto/setting.dto';

@Injectable()
export class SettingUseCases {
  constructor(private settingFactoryServices: SettingFactoryService) {}

  async updateSetting(
    id: Types.ObjectId,
    updateSettingDto: SettingDto,
    userId: Types.ObjectId,
  ) {
    return await this.settingFactoryServices.updateSetting(
      id,
      updateSettingDto,
      userId,
    );
  }
  async getSettings(id: Types.ObjectId) {
    return await this.settingFactoryServices.getSettings(id);
  }
}
