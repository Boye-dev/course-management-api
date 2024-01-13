import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDataServices } from 'src/core';
import { CreateSchoolDto } from 'src/core/dto/school.dto';

@Injectable()
export class SchoolFactoryService {
  constructor(private dataServices: IDataServices) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    try {
      const school = await this.dataServices.schools.findOne({
        name: createSchoolDto.name.toLowerCase(),
      });
      if (school) {
        throw new BadRequestException(`${createSchoolDto.name} already exists`);
      }
      return await this.dataServices.schools.create(createSchoolDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
