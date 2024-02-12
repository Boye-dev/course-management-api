import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import {
  IDataServices,
  StudentEnrolledCourse,
  TeacherEnrolledCourse,
} from 'src/core';
import {
  CreateCourseDto,
  EnrollCourseStudentDto,
  UpdateCourseDto,
} from 'src/core/dto/course.dto';
import { CourseQueryDto, QueryDto } from 'src/core/dto/query.dto';
import {
  RegistrationStatusEnum,
  RolesEnum,
} from 'src/core/interfaces/user.interfaces';

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

  async updateScore(courseId: Types.ObjectId, score: number) {
    try {
      const course =
        await this.dataServices.studentEnrolledCourses.findById(courseId);
      if (!course) {
        throw new BadRequestException(`Course does not exists`);
      }
      course.score = score;
      course.markModified('score');

      return await course.save();
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
        operation.push({ yearTaken: Number(query.yearTaken) });
      }
      if (query.units) {
        operation.push({ units: Number(query.units) });
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
  async studentEnroll(
    studentId: Types.ObjectId,
    enrollDto: EnrollCourseStudentDto,
  ) {
    try {
      const settings = await this.dataServices.settings.findById(
        new Types.ObjectId('65a2d4069a03ce9ea7069c1d'),
      );

      const user = await this.dataServices.users.findById(studentId);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }
      const regStatus = Object.keys(user.registrationStatus).find(
        (regYear) => regYear === enrollDto.year,
      );

      if (!regStatus) {
        throw new BadRequestException('Year not found');
      }

      if (
        user.registrationStatus[regStatus].includes(
          RegistrationStatusEnum.Registered,
        )
      ) {
        if (
          !user.registrationStatus[regStatus].includes(
            RegistrationStatusEnum.Can_Update,
          )
        ) {
          throw new BadRequestException(
            'You have registered for this semester',
          );
        }
      }
      const canRegister = Object.keys(settings.registrationAllowed).find(
        (reg) => reg === regStatus,
      );

      if (!canRegister) {
        throw new BadRequestException('Registration not open for this year');
      }

      const endDate = new Date(
        settings.registrationAllowed[canRegister].closed,
      );
      const currentDate = new Date();
      if (
        currentDate > endDate &&
        user.registrationStatus[regStatus].includes(
          RegistrationStatusEnum.Not_Registered,
        )
      ) {
        throw new BadRequestException('Registration has closed for this year');
      }

      if (Array.isArray(enrollDto.courses)) {
        const queries: QueryDto = {
          findOperation: {
            _id: { $in: enrollDto.courses },
          },
        };
        const coursesExists =
          await this.dataServices.teacherEnrolledCourses.findAll(queries);

        if (coursesExists.data.length !== enrollDto.courses.length) {
          throw new BadRequestException('Some courses do not exists');
        }

        let coursesArray = [];

        enrollDto.courses.forEach((course) =>
          coursesArray.push({
            student: studentId,
            course: course,
            score: -2,
            year: enrollDto.year,
          }),
        );

        const studentQueries: QueryDto = {
          findOperation: {
            $or: coursesArray.map((course) => {
              return {
                course: course.course,
                year: course.year,
                student: studentId,
              };
            }),
          },
        };
        const studenthasEnrolled =
          await this.dataServices.studentEnrolledCourses.findAll(
            studentQueries,
          );

        if (studenthasEnrolled.data.length > 0) {
          studenthasEnrolled.data.forEach(
            (studentCourse: StudentEnrolledCourse) => {
              coursesArray = coursesArray.filter(
                (item: StudentEnrolledCourse) =>
                  item.course.toString() !== studentCourse.course.toString() &&
                  item.year === studentCourse.year,
              );
            },
          );
        }

        await this.dataServices.studentEnrolledCourses.insertMany(coursesArray);

        const status = user.registrationStatus[regStatus].filter(
          (y) => y !== RegistrationStatusEnum.Not_Registered,
        );
        status.push(RegistrationStatusEnum.Registered);
        user.registrationStatus[regStatus] = [...new Set(status)];
        user.markModified('registrationStatus');
        return await user.save();
      }
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
  async getTeacherEnrolledCourses(
    teacherId: Types.ObjectId,
    query?: CourseQueryDto,
  ) {
    try {
      const user = await this.dataServices.users.findById(teacherId);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }
      const param: QueryDto = {
        search: query.search,
        searchBy: Array.isArray(query.searchBy)
          ? query.searchBy
          : query.searchBy && [query.searchBy],
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page && Number(query.page),
        pageSize: query.pageSize && Number(query.pageSize),
        findOperation: {
          teacher: teacherId,
        },
      };
      const operation = [];
      if (query.units) {
        operation.push({
          'course.course.units': Number(query.units),
        });
      }
      operation.push({ teacher: new mongoose.Types.ObjectId(teacherId) });
      if (operation.length > 0) {
        param.findOperation = {
          $and: operation,
        };
      }
      const page = param?.page - 1 || 0;
      const pageSize = param?.pageSize || 10;

      const search = param?.search || '';
      const searchBy = param?.searchBy || [];
      const searchObject = [];

      for (const option of searchBy) {
        const optionObj = {};
        optionObj[option] = { $regex: search, $options: 'i' };
        searchObject.push(optionObj);
      }

      const findOperation = param?.findOperation;

      const sortBy = param?.sortBy || null;
      let match: Record<any, any>;
      if (searchObject.length > 0) {
        match = { $and: [{ $or: searchObject }, { ...findOperation }] };
      } else {
        match = { ...findOperation };
      }
      const aggregrate = [
        {
          $facet: {
            total: [
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.department',
                  foreignField: '_id',
                  as: 'course.department',
                },
              },
              {
                $unwind: '$course.department',
              },

              {
                $match: match,
              },

              {
                $count: 'total',
              },
            ],
            documents: [
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.department',
                  foreignField: '_id',
                  as: 'course.department',
                },
              },
              {
                $unwind: '$course.department',
              },

              {
                $match: match,
              },
              {
                $sort: {
                  [sortBy]:
                    param?.sortOrder === 'asc'
                      ? 1
                      : param?.sortOrder === 'desc'
                        ? -1
                        : 1,
                },
              },
              {
                $skip: page * pageSize,
              },
              {
                $limit: pageSize,
              },
            ],
          },
        },
      ];

      return await this.dataServices.teacherEnrolledCourses.findAggregate(
        aggregrate,
        page,
        pageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getStudentEnrolledCourses(query?: CourseQueryDto) {
    try {
      const param: QueryDto = {
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
            departmentObj.push({
              'teacher.department._id': new mongoose.Types.ObjectId(sch),
            }),
          );
        } else {
          departmentObj.push({
            'teacher.department._id': new mongoose.Types.ObjectId(
              query.department,
            ),
          });
        }
        operation.push({ $or: [...departmentObj] });
      }

      if (query.course) {
        const courseObj = [];
        if (Array.isArray(query.course)) {
          query.course.forEach((crs) =>
            courseObj.push({
              'course._id': new mongoose.Types.ObjectId(crs),
            }),
          );
        } else {
          courseObj.push({
            'course._id': new mongoose.Types.ObjectId(query.course),
          });
        }
        operation.push({ $or: [...courseObj] });
      }

      if (query.yearTaken) {
        operation.push({
          'course.yearTaken': Number(query.yearTaken),
        });
      }

      if (operation.length > 0) {
        param.findOperation = {
          $and: operation,
        };
      }
      const page = param?.page - 1 || 0;
      const pageSize = param?.pageSize || 10;

      const search = param?.search || '';
      const searchBy = param?.searchBy || [];
      const searchObject = [];

      for (const option of searchBy) {
        const optionObj = {};
        optionObj[option] = { $regex: search, $options: 'i' };
        searchObject.push(optionObj);
      }
      const findOperation = param?.findOperation;

      const sortBy = param?.sortBy || null;
      let match: Record<any, any>;
      if (searchObject.length > 0) {
        match = { $and: [{ $or: searchObject }, { ...findOperation }] };
      } else {
        match = { ...findOperation };
      }

      const aggregrate = [
        {
          $facet: {
            total: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'teacher',
                  foreignField: '_id',
                  as: 'teacher',
                },
              },
              {
                $unwind: '$teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'teacher.department',
                  foreignField: '_id',
                  as: 'teacher.department',
                },
              },
              {
                $unwind: '$teacher.department',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.department',
                  foreignField: '_id',
                  as: 'course.department',
                },
              },
              {
                $unwind: '$course.department',
              },
              {
                $match: match,
              },
              {
                $count: 'total',
              },
            ],
            documents: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'teacher',
                  foreignField: '_id',
                  as: 'teacher',
                },
              },
              {
                $unwind: '$teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'teacher.department',
                  foreignField: '_id',
                  as: 'teacher.department',
                },
              },
              {
                $unwind: '$teacher.department',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },

              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.department',
                  foreignField: '_id',
                  as: 'course.department',
                },
              },
              {
                $unwind: '$course.department',
              },
              {
                $match: match,
              },
              {
                $sort: {
                  [sortBy]:
                    param?.sortOrder === 'asc'
                      ? 1
                      : param?.sortOrder === 'desc'
                        ? -1
                        : 1,
                },
              },
              {
                $skip: page * pageSize,
              },
              {
                $limit: pageSize,
              },
            ],
          },
        },
      ];

      return await this.dataServices.teacherEnrolledCourses.findAggregate(
        aggregrate,
        page,
        pageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getStudentMyCourses(studentId: Types.ObjectId, query?: CourseQueryDto) {
    try {
      const param: QueryDto = {
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
            departmentObj.push({
              'course.course.department._id': new mongoose.Types.ObjectId(sch),
            }),
          );
        } else {
          departmentObj.push({
            'course.course.department._id': new mongoose.Types.ObjectId(
              query.department,
            ),
          });
        }
        operation.push({ $or: [...departmentObj] });
      }
      if (query.grade) {
        const gradeObj = [];
        if (Array.isArray(query.grade)) {
          query.grade.forEach((sch) =>
            gradeObj.push({
              grade: sch,
            }),
          );
        } else {
          gradeObj.push({
            grade: query.grade,
          });
        }
        operation.push({ $or: [...gradeObj] });
      }
      if (query.yearTaken) {
        operation.push({
          year: query.yearTaken,
        });
      }
      if (query.units) {
        operation.push({
          'course.course.units': Number(query.units),
        });
      }
      operation.push({ student: new mongoose.Types.ObjectId(studentId) });
      if (operation.length > 0) {
        param.findOperation = {
          $and: operation,
        };
      }
      const page = param?.page - 1 || 0;
      const pageSize = param?.pageSize || 10;

      const search = param?.search || '';
      const searchBy = param?.searchBy || [];
      const searchObject = [];

      for (const option of searchBy) {
        const optionObj = {};
        optionObj[option] = { $regex: search, $options: 'i' };
        searchObject.push(optionObj);
      }

      const findOperation = param?.findOperation;

      const sortBy = param?.sortBy || null;
      let match: Record<any, any>;
      if (searchObject.length > 0) {
        match = { $and: [{ $or: searchObject }, { ...findOperation }] };
      } else {
        match = { ...findOperation };
      }
      const aggregrate = [
        {
          $facet: {
            total: [
              {
                $lookup: {
                  from: 'teacherenrolledcourses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course.course',
                  foreignField: '_id',
                  as: 'course.course',
                },
              },
              {
                $unwind: '$course.course',
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'course.teacher',
                  foreignField: '_id',
                  as: 'course.teacher',
                },
              },
              {
                $unwind: '$course.teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.teacher.department',
                  foreignField: '_id',
                  as: 'course.teacher.department',
                },
              },
              {
                $unwind: '$course.teacher.department',
              },
              {
                $addFields: {
                  grade: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: 'F1' },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 0] },
                              { $lte: ['$score', 39] },
                            ],
                          },
                          then: 'F',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 40] },
                              { $lte: ['$score', 44] },
                            ],
                          },
                          then: 'E',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 45] },
                              { $lte: ['$score', 49] },
                            ],
                          },
                          then: 'D',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 50] },
                              { $lte: ['$score', 59] },
                            ],
                          },
                          then: 'C',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 60] },
                              { $lte: ['$score', 79] },
                            ],
                          },
                          then: 'B',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 80] },
                              { $lte: ['$score', 100] },
                            ],
                          },
                          then: 'A',
                        },
                      ],
                      default: 'NG',
                    },
                  },
                },
              },

              {
                $addFields: {
                  gp: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: '0' },
                      ],
                      default: {
                        $switch: {
                          branches: [
                            {
                              case: { $eq: ['$grade', 'A'] },
                              then: { $multiply: ['$course.course.units', 5] },
                            },

                            {
                              case: { $eq: ['$grade', 'B'] },
                              then: { $multiply: ['$course.course.units', 4] },
                            },
                            {
                              case: { $eq: ['$grade', 'C'] },
                              then: { $multiply: ['$course.course.units', 3] },
                            },
                            {
                              case: { $eq: ['$grade', 'D'] },
                              then: { $multiply: ['$course.course.units', 2] },
                            },
                            {
                              case: { $eq: ['$grade', 'E'] },
                              then: { $multiply: ['$course.course.units', 1] },
                            },
                            {
                              case: { $eq: ['$grade', 'F'] },
                              then: { $multiply: ['$course.course.units', 0] },
                            },
                          ],
                          default: 0,
                        },
                      },
                    },
                  },
                },
              },
              {
                $match: match,
              },

              {
                $count: 'total',
              },
            ],
            documents: [
              {
                $lookup: {
                  from: 'teacherenrolledcourses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course.course',
                  foreignField: '_id',
                  as: 'course.course',
                },
              },
              {
                $unwind: '$course.course',
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'course.teacher',
                  foreignField: '_id',
                  as: 'course.teacher',
                },
              },
              {
                $unwind: '$course.teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.teacher.department',
                  foreignField: '_id',
                  as: 'course.teacher.department',
                },
              },
              {
                $unwind: '$course.teacher.department',
              },
              {
                $addFields: {
                  grade: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: 'F1' },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 0] },
                              { $lte: ['$score', 39] },
                            ],
                          },
                          then: 'F',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 40] },
                              { $lte: ['$score', 44] },
                            ],
                          },
                          then: 'E',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 45] },
                              { $lte: ['$score', 49] },
                            ],
                          },
                          then: 'D',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 50] },
                              { $lte: ['$score', 59] },
                            ],
                          },
                          then: 'C',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 60] },
                              { $lte: ['$score', 79] },
                            ],
                          },
                          then: 'B',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 80] },
                              { $lte: ['$score', 100] },
                            ],
                          },
                          then: 'A',
                        },
                      ],
                      default: 'NG',
                    },
                  },
                },
              },

              {
                $addFields: {
                  gp: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: '0' },
                      ],
                      default: {
                        $switch: {
                          branches: [
                            {
                              case: { $eq: ['$grade', 'A'] },
                              then: { $multiply: ['$course.course.units', 5] },
                            },

                            {
                              case: { $eq: ['$grade', 'B'] },
                              then: { $multiply: ['$course.course.units', 4] },
                            },
                            {
                              case: { $eq: ['$grade', 'C'] },
                              then: { $multiply: ['$course.course.units', 3] },
                            },
                            {
                              case: { $eq: ['$grade', 'D'] },
                              then: { $multiply: ['$course.course.units', 2] },
                            },
                            {
                              case: { $eq: ['$grade', 'E'] },
                              then: { $multiply: ['$course.course.units', 1] },
                            },
                            {
                              case: { $eq: ['$grade', 'F'] },
                              then: { $multiply: ['$course.course.units', 0] },
                            },
                          ],
                          default: 0,
                        },
                      },
                    },
                  },
                },
              },
              {
                $match: match,
              },
              {
                $sort: {
                  [sortBy]:
                    param?.sortOrder === 'asc'
                      ? 1
                      : param?.sortOrder === 'desc'
                        ? -1
                        : 1,
                },
              },
              {
                $skip: page * pageSize,
              },
              {
                $limit: pageSize,
              },
            ],
          },
        },
      ];

      return await this.dataServices.studentEnrolledCourses.findAggregate(
        aggregrate,
        page,
        pageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getTeacherstMyStudents(
    teacherId: Types.ObjectId,
    courseId: Types.ObjectId,
    year: string,
    query?: CourseQueryDto,
  ) {
    try {
      const param: QueryDto = {
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
            departmentObj.push({
              'course.department._id': new mongoose.Types.ObjectId(sch),
            }),
          );
        } else {
          departmentObj.push({
            'course.department._id': new mongoose.Types.ObjectId(
              query.department,
            ),
          });
        }
        operation.push({ $or: [...departmentObj] });
      }
      if (query.yearTaken) {
        operation.push({
          year: Number(query.yearTaken),
        });
      }
      operation.push({
        'course.teacher._id': new mongoose.Types.ObjectId(teacherId),
      });
      operation.push({
        'course.course._id': new mongoose.Types.ObjectId(courseId),
      });
      operation.push({
        year,
      });
      if (operation.length > 0) {
        param.findOperation = {
          $and: operation,
        };
      }
      const page = param?.page - 1 || 0;
      const pageSize = param?.pageSize || 10;

      const search = param?.search || '';
      const searchBy = param?.searchBy || [];
      const searchObject = [];

      for (const option of searchBy) {
        const optionObj = {};
        optionObj[option] = { $regex: search, $options: 'i' };
        searchObject.push(optionObj);
      }

      const findOperation = param?.findOperation;

      const sortBy = param?.sortBy || null;
      let match: Record<any, any>;
      if (searchObject.length > 0) {
        match = { $and: [{ $or: searchObject }, { ...findOperation }] };
      } else {
        match = { ...findOperation };
      }
      const aggregrate = [
        {
          $facet: {
            total: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'student',
                  foreignField: '_id',
                  as: 'student',
                },
              },
              {
                $unwind: '$student',
              },
              {
                $lookup: {
                  from: 'teacherenrolledcourses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course.course',
                  foreignField: '_id',
                  as: 'course.course',
                },
              },
              {
                $unwind: '$course.course',
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'course.teacher',
                  foreignField: '_id',
                  as: 'course.teacher',
                },
              },
              {
                $unwind: '$course.teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.teacher.department',
                  foreignField: '_id',
                  as: 'course.teacher.department',
                },
              },
              {
                $unwind: '$course.teacher.department',
              },
              {
                $match: match,
              },
              {
                $count: 'total',
              },
            ],
            documents: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'student',
                  foreignField: '_id',
                  as: 'student',
                },
              },
              {
                $unwind: '$student',
              },
              {
                $lookup: {
                  from: 'teacherenrolledcourses',
                  localField: 'course',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              {
                $unwind: '$course',
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'course.course',
                  foreignField: '_id',
                  as: 'course.course',
                },
              },
              {
                $unwind: '$course.course',
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'course.teacher',
                  foreignField: '_id',
                  as: 'course.teacher',
                },
              },
              {
                $unwind: '$course.teacher',
              },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'course.teacher.department',
                  foreignField: '_id',
                  as: 'course.teacher.department',
                },
              },
              {
                $unwind: '$course.teacher.department',
              },
              {
                $match: match,
              },
              {
                $sort: {
                  [sortBy]:
                    param?.sortOrder === 'asc'
                      ? 1
                      : param?.sortOrder === 'desc'
                        ? -1
                        : 1,
                },
              },
              {
                $skip: page * pageSize,
              },
              {
                $limit: pageSize,
              },
              {
                $addFields: {
                  grade: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: 'F1' },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 0] },
                              { $lte: ['$score', 39] },
                            ],
                          },
                          then: 'F',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 40] },
                              { $lte: ['$score', 44] },
                            ],
                          },
                          then: 'E',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 45] },
                              { $lte: ['$score', 49] },
                            ],
                          },
                          then: 'D',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 50] },
                              { $lte: ['$score', 59] },
                            ],
                          },
                          then: 'C',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 60] },
                              { $lte: ['$score', 79] },
                            ],
                          },
                          then: 'B',
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ['$score', 80] },
                              { $lte: ['$score', 100] },
                            ],
                          },
                          then: 'A',
                        },
                      ],
                      default: 'NG',
                    },
                  },
                },
              },
              {
                $addFields: {
                  gp: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$score', -2] }, then: 'NG' },
                        { case: { $eq: ['$score', -1] }, then: '0' },
                      ],
                      default: {
                        $switch: {
                          branches: [
                            {
                              case: { $eq: ['$grade', 'A'] },
                              then: { $multiply: ['$course.course.units', 5] },
                            },

                            {
                              case: { $eq: ['$grade', 'B'] },
                              then: { $multiply: ['$course.course.units', 4] },
                            },
                            {
                              case: { $eq: ['$grade', 'C'] },
                              then: { $multiply: ['$course.course.units', 3] },
                            },
                            {
                              case: { $eq: ['$grade', 'D'] },
                              then: { $multiply: ['$course.course.units', 2] },
                            },
                            {
                              case: { $eq: ['$grade', 'E'] },
                              then: { $multiply: ['$course.course.units', 1] },
                            },
                            {
                              case: { $eq: ['$grade', 'F'] },
                              then: { $multiply: ['$course.course.units', 0] },
                            },
                          ],
                          default: 0,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ];

      return await this.dataServices.studentEnrolledCourses.findAggregate(
        aggregrate,
        page,
        pageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
