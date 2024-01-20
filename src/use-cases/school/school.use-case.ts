import { Injectable } from '@nestjs/common';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/core/dto/school.dto';
import { SchoolFactoryService } from './school-factory.service';
import { Types } from 'mongoose';
import { SchoolQueryDto } from 'src/core/dto/query.dto';

@Injectable()
export class SchoolUseCases {
  constructor(private schoolFactoryService: SchoolFactoryService) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    return await this.schoolFactoryService.createSchool(createSchoolDto);
  }

  async editSchool(updateSchoolDto: UpdateSchoolDto, id: Types.ObjectId) {
    return await this.schoolFactoryService.editSchool(updateSchoolDto, id);
  }
  async getAll(query?: SchoolQueryDto) {
    return await this.schoolFactoryService.getAll(query);
  }
}
