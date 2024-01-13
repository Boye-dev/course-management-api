import { Injectable } from '@nestjs/common';
import { DepartmentFactoryService } from './department-factory.service';
import { CreateDepartmentDto } from 'src/core/dto/department.dto';

@Injectable()
export class DepartmentUseCases {
  constructor(private departmentFactoryService: DepartmentFactoryService) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentFactoryService.createDepartment(
      createDepartmentDto,
    );
  }
}
