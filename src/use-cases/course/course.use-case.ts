import { Injectable } from '@nestjs/common';
import { CourseFactoryService } from './course-factory.service';
import { CreateCourseDto, UpdateCourseDto } from 'src/core/dto/course.dto';
import { Types } from 'mongoose';
import { CourseQueryDto } from 'src/core/dto/query.dto';

@Injectable()
export class CourseUseCases {
  constructor(private courseFactoryService: CourseFactoryService) {}

  async createCourse(createCourseDto: CreateCourseDto) {
    return await this.courseFactoryService.createCourse(createCourseDto);
  }

  async editCourse(updateCourseDto: UpdateCourseDto, id: Types.ObjectId) {
    return await this.courseFactoryService.editCourse(updateCourseDto, id);
  }
  async getAll(query?: CourseQueryDto) {
    return await this.courseFactoryService.getAll(query);
  }
  async getTeacherEnrolledCourses(teacherId: Types.ObjectId) {
    return await this.courseFactoryService.getTeacherEnrolledCourses(teacherId);
  }

  async teacherEnroll(
    teacherId: Types.ObjectId,
    courses: Types.ObjectId[] | Types.ObjectId,
  ) {
    return await this.courseFactoryService.teacherEnroll(teacherId, courses);
  }
}
