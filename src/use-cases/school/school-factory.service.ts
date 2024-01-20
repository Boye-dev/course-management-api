import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDataServices } from 'src/core';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/core/dto/school.dto';
import { Types } from 'mongoose';
import { QueryDto, SchoolQueryDto } from 'src/core/dto/query.dto';
@Injectable()
export class SchoolFactoryService {
  constructor(private dataServices: IDataServices) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    try {
      const school = await this.dataServices.schools.findOne({
        $or: [
          {
            name: createSchoolDto.name.toLowerCase(),
          },
          {
            code: createSchoolDto.code.toUpperCase(),
          },
        ],
      });
      if (school) {
        throw new BadRequestException(
          `${createSchoolDto.name}/ ${createSchoolDto.code} already exists`,
        );
      }
      return await this.dataServices.schools.create(createSchoolDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async editSchool(updateSchoolDto: UpdateSchoolDto, id: Types.ObjectId) {
    try {
      const school = await this.dataServices.schools.findById(id);
      if (!school) {
        throw new BadRequestException(`School does not exists`);
      }

      const schoolExists = await this.dataServices.schools.findOne({
        $or: [
          {
            name:
              updateSchoolDto?.name?.toLowerCase() === school.name.toLowerCase()
                ? ''
                : updateSchoolDto?.name?.toLowerCase(),
          },
          {
            code:
              updateSchoolDto?.code?.toUpperCase() === school.code.toUpperCase()
                ? ''
                : updateSchoolDto?.code?.toUpperCase(),
          },
        ],
      });
      if (schoolExists) {
        throw new BadRequestException(
          `${updateSchoolDto.name ? updateSchoolDto.name + ' ' : ''}${
            updateSchoolDto.code || ''
          } already exists`,
        );
      }
      return await this.dataServices.schools.update(id, updateSchoolDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getAll(query?: SchoolQueryDto) {
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

      const schools = await this.dataServices.schools.findAll(queries);
      return schools;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
