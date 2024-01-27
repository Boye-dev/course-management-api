import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDataServices, TeacherEnrolledCourse } from 'src/core';
import { CreateCourseDto, UpdateCourseDto } from 'src/core/dto/course.dto';
import { CourseQueryDto, QueryDto } from 'src/core/dto/query.dto';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';

@Injectable()
export class CourseFactoryService {
  constructor(private dataServices: IDataServices) {}

  async createCourse(createCourseDto: CreateCourseDto) {
    try {
      const department = await this.dataServices.departments.findById(
        createCourseDto.department,
      );
      if (!department) {
        throw new BadRequestException('Department not found');
      }
      const course = await this.dataServices.courses.findOne({
        $or: [
          {
            name: createCourseDto.name.toLowerCase(),
          },
          {
            code:
              department.code +
              createCourseDto.yearTaken +
              createCourseDto.code,
          },
        ],
      });
      if (course) {
        throw new BadRequestException(
          `${createCourseDto.name}/ ${createCourseDto.code} already exists`,
        );
      }
      createCourseDto.code =
        department.code + createCourseDto.yearTaken + createCourseDto.code;
      return await this.dataServices.courses.create(createCourseDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async editCourse(updateCourseDto: UpdateCourseDto, id: Types.ObjectId) {
    try {
      const course = await this.dataServices.courses.findById(id);
      if (!course) {
        throw new BadRequestException(`Course does not exists`);
      }
      const department = await this.dataServices.departments.findById(
        course.department,
      );
      if (!department) {
        throw new BadRequestException('Department not found');
      }
      const courseExists = await this.dataServices.courses.findOne({
        $or: [
          {
            name:
              updateCourseDto?.name?.toLowerCase() === course.name.toLowerCase()
                ? ''
                : updateCourseDto?.name?.toLowerCase(),
          },
          {
            code:
              department.code +
                course.yearTaken +
                updateCourseDto?.code?.toUpperCase() ===
              course.code.toUpperCase()
                ? ''
                : department.code +
                  course.yearTaken +
                  updateCourseDto?.code?.toUpperCase(),
          },
        ],
      });
      if (courseExists) {
        throw new BadRequestException(
          `${updateCourseDto.name ? updateCourseDto.name + ' ' : ''}${
            updateCourseDto.code || ''
          } already exists`,
        );
      }
      updateCourseDto.code =
        department.code + course.yearTaken + updateCourseDto.code;

      return await this.dataServices.courses.update(id, updateCourseDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getAll(query?: CourseQueryDto) {
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

      if (query.department) {
        const departmentObj = [];
        if (Array.isArray(query.department)) {
          query.department.forEach((sch) =>
            departmentObj.push({ department: sch }),
          );
        } else {
          departmentObj.push({ department: query.department });
        }
        operation.push({ $or: [...departmentObj] });
      }
      if (query.yearTaken) {
        operation.push({ yearsTaken: Number(query.yearTaken) });
      }
      if (operation.length > 0) {
        queries.findOperation = {
          $and: operation,
        };
      }

      const courses = await this.dataServices.courses.findAll(
        queries,
        'department',
      );
      return courses;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async teacherEnroll(
    teacherId: Types.ObjectId,
    courses: Types.ObjectId[] | Types.ObjectId,
  ) {
    try {
      const user = await this.dataServices.users.findById(teacherId);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }
      if (user.role !== RolesEnum.Teacher) {
        throw new BadRequestException(`Not a teacher`);
      }
      if (Array.isArray(courses)) {
        const queries: QueryDto = {
          findOperation: {
            _id: { $in: courses },
          },
        };
        const coursesExists = await this.dataServices.courses.findAll(queries);

        if (coursesExists.data.length !== courses.length) {
          throw new BadRequestException('Some courses do not exists');
        }

        let coursesArray = [];

        courses.forEach((courseId) =>
          coursesArray.push({ teacher: teacherId, course: courseId }),
        );
        if (!Array.isArray(courses)) {
          coursesArray.push({ teacher: teacherId, course: courses });
        }
        const teacherQueries: QueryDto = {
          findOperation: {
            $or: coursesArray,
          },
        };
        const teacherhasEnrolled =
          await this.dataServices.teacherEnrolledCourses.findAll(
            teacherQueries,
          );

        if (teacherhasEnrolled.data.length > 0) {
          teacherhasEnrolled.data.forEach(
            (teacherCourse: TeacherEnrolledCourse) => {
              coursesArray = coursesArray.filter(
                (item: TeacherEnrolledCourse) =>
                  item.course.toString() !== teacherCourse.course.toString(),
              );
            },
          );
        }

        return await this.dataServices.teacherEnrolledCourses.insertMany(
          coursesArray,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getTeacherEnrolledCourses(teacherId: Types.ObjectId) {
    try {
      const user = await this.dataServices.users.findById(teacherId);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }
      const queries: QueryDto = {
        findOperation: {
          teacher: teacherId,
        },
      };
      return await this.dataServices.teacherEnrolledCourses.findAll(queries, {
        path: 'course',
        populate: {
          path: 'department',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
