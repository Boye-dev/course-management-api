import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDataServices } from 'src/core';
import { SettingDto } from 'src/core/dto/setting.dto';

@Injectable()
export class SettingFactoryService {
  constructor(private dataService: IDataServices) {}

  async updateSetting(
    id: Types.ObjectId,
    updateSettingDto: SettingDto,
    userId: Types.ObjectId,
  ) {
    try {
      const setting = await this.dataService.settings.findById(id);
      if (!setting) {
        throw new BadRequestException(`Setting not found`);
      }

      const updateSetting = {
        ...updateSettingDto,
        updatedBy: userId,
      };

      const updatedSetting = await this.dataService.settings.update(
        id,
        updateSetting,
      );
      return updatedSetting.populate('updatedBy');
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
