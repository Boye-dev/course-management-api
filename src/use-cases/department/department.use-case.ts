import { Injectable } from '@nestjs/common';
import { DepartmentFactoryService } from './department-factory.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'src/core/dto/department.dto';
import { Types } from 'mongoose';
import { DepartmentQueryDto } from 'src/core/dto/query.dto';

@Injectable()
export class DepartmentUseCases {
  constructor(private departmentFactoryService: DepartmentFactoryService) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentFactoryService.createDepartment(
      createDepartmentDto,
    );
  }

  async editDepartment(
    updateDepartmentDto: UpdateDepartmentDto,
    id: Types.ObjectId,
  ) {
    return await this.departmentFactoryService.editDepartment(
      updateDepartmentDto,
      id,
    );
  }
  async getAll(query?: DepartmentQueryDto) {
    return await this.departmentFactoryService.getAll(query);
  }
}
