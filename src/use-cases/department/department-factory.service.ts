import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDataServices } from 'src/core';
import { CreateDepartmentDto } from 'src/core/dto/department.dto';

@Injectable()
export class DepartmentFactoryService {
  constructor(private dataServices: IDataServices) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    try {
      const department = await this.dataServices.departments.findOne({
        name: createDepartmentDto.name.toLowerCase(),
      });
      if (department) {
        throw new BadRequestException(
          `${createDepartmentDto.name} already exists`,
        );
      }
      const school = await this.dataServices.schools.findById(
        createDepartmentDto.school,
      );
      if (!school) {
        throw new BadRequestException(`${school.name} does not exist`);
      }
      return await this.dataServices.departments.create(createDepartmentDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
