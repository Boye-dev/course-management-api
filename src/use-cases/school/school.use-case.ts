import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from 'src/core/dto/school.dto';
import { SchoolFactoryService } from './school-factory.service';

@Injectable()
export class SchoolUseCases {
  constructor(private schoolFactoryService: SchoolFactoryService) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    return await this.schoolFactoryService.createSchool(createSchoolDto);
  }
}
