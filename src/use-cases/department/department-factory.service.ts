import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDataServices } from 'src/core';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'src/core/dto/department.dto';
import { DepartmentQueryDto, QueryDto } from 'src/core/dto/query.dto';

@Injectable()
export class DepartmentFactoryService {
  constructor(private dataServices: IDataServices) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    try {
      const school = await this.dataServices.schools.findById(
        createDepartmentDto.school,
      );
      if (!school) {
        throw new BadRequestException('School not found');
      }
      const department = await this.dataServices.departments.findOne({
        $or: [
          {
            name: createDepartmentDto.name.toLowerCase(),
          },
          {
            code: createDepartmentDto.code.toUpperCase(),
          },
        ],
      });
      if (department) {
        throw new BadRequestException(
          `${createDepartmentDto.name}/ ${createDepartmentDto.code} already exists`,
        );
      }

      return await this.dataServices.departments.create(createDepartmentDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async editDepartment(
    updateDepartmentDto: UpdateDepartmentDto,
    id: Types.ObjectId,
  ) {
    try {
      const department = await this.dataServices.departments.findById(id);
      if (!department) {
        throw new BadRequestException(`Department does not exists`);
      }

      const departmentExists = await this.dataServices.departments.findOne({
        $or: [
          {
            name:
              updateDepartmentDto?.name?.toLowerCase() ===
              department.name.toLowerCase()
                ? ''
                : updateDepartmentDto?.name?.toLowerCase(),
          },
          {
            code:
              updateDepartmentDto?.code?.toUpperCase() ===
              department.code.toUpperCase()
                ? ''
                : updateDepartmentDto?.code?.toUpperCase(),
          },
        ],
      });
      if (departmentExists) {
        throw new BadRequestException(
          `${updateDepartmentDto.name ? updateDepartmentDto.name + ' ' : ''}${
            updateDepartmentDto.code || ''
          } already exists`,
        );
      }
      return await this.dataServices.departments.update(
        id,
        updateDepartmentDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getAll(query?: DepartmentQueryDto) {
    try {
      const queries: QueryDto = {
        search: query.search,
        searchBy: Array.isArray(query.searchBy)
          ? query.searchBy
          : query.searchBy && [query.searchBy],
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page && Number(query.page),
        pageSize: query.pageSize && Number(query.pageSize),
      };
      const operation = [];

      if (query.school) {
        const schoolObj = [];
        if (Array.isArray(query.school)) {
          query.school.forEach((sch) => schoolObj.push({ school: sch }));
        } else {
          schoolObj.push({ school: query.school });
        }
        operation.push({ $or: [...schoolObj] });
      }
      if (query.yearsTaken) {
        operation.push({ yearsTaken: Number(query.yearsTaken) });
      }
      if (operation.length > 0) {
        queries.findOperation = {
          $and: operation,
        };
      }

      const departments = await this.dataServices.departments.findAll(
        queries,
        'school',
      );
      return departments;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
