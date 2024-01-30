import { Injectable } from '@nestjs/common';
import { CourseFactoryService } from './course-factory.service';
import {
  CreateCourseDto,
  EnrollCourseStudentDto,
  UpdateCourseDto,
} from 'src/core/dto/course.dto';
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
  async updateScore(courseId: Types.ObjectId, score: number) {
    return await this.courseFactoryService.updateScore(courseId, score);
  }
  async getAll(query?: CourseQueryDto) {
    return await this.courseFactoryService.getAll(query);
  }
  async getTeacherEnrolledCourses(
    teacherId: Types.ObjectId,
    query?: CourseQueryDto,
  ) {
    return await this.courseFactoryService.getTeacherEnrolledCourses(
      teacherId,
      query,
    );
  }

  async teacherEnroll(
    teacherId: Types.ObjectId,
    courses: Types.ObjectId[] | Types.ObjectId,
  ) {
    return await this.courseFactoryService.teacherEnroll(teacherId, courses);
  }

  async studentEnroll(
    studentId: Types.ObjectId,
    enrollDto: EnrollCourseStudentDto,
  ) {
    return await this.courseFactoryService.studentEnroll(studentId, enrollDto);
  }

  async getStudentEnrolledCourses(query?: CourseQueryDto) {
    return await this.courseFactoryService.getStudentEnrolledCourses(query);
  }
  async getStudentMyCourses(studentId: Types.ObjectId, query?: CourseQueryDto) {
    return await this.courseFactoryService.getStudentMyCourses(
      studentId,
      query,
    );
  }
  async getTeacherstMyStudents(
    teacherId: Types.ObjectId,
    courseId: Types.ObjectId,
    year: string,
    query?: CourseQueryDto,
  ) {
    return await this.courseFactoryService.getTeacherstMyStudents(
      teacherId,
      courseId,
      year,
      query,
    );
  }
}
