import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDataServices } from '../../../core';
import { MongoGenericRepository } from './mongo-generic-repository';
import {
  Course,
  CourseDocument,
  Department,
  DepartmentDocument,
  School,
  SchoolDocument,
  Setting,
  SettingDocument,
  TeacherEnrolledCourse,
  TeacherEnrolledCourseDocument,
  User,
  UserDocument,
} from './model';

@Injectable()
export class MongoDataServices
  implements IDataServices, OnApplicationBootstrap
{
  users: MongoGenericRepository<User>;
  departments: MongoGenericRepository<Department>;
  schools: MongoGenericRepository<School>;
  settings: MongoGenericRepository<Setting>;
  courses: MongoGenericRepository<Course>;
  teacherEnrolledCourses: MongoGenericRepository<TeacherEnrolledCourse>;

  constructor(
    @InjectModel(User.name)
    private UserRepository: Model<UserDocument>,
    @InjectModel(Department.name)
    private DepartmentRepository: Model<DepartmentDocument>,
    @InjectModel(School.name)
    private SchoolRepository: Model<SchoolDocument>,
    @InjectModel(Setting.name)
    private SettingRepository: Model<SettingDocument>,
    @InjectModel(Course.name)
    private CourseRepository: Model<CourseDocument>,
    @InjectModel(TeacherEnrolledCourse.name)
    private TeacherEnrolledCourseRepository: Model<TeacherEnrolledCourseDocument>,
  ) {}

  onApplicationBootstrap() {
    this.users = new MongoGenericRepository<User>(this.UserRepository);
    this.departments = new MongoGenericRepository<Department>(
      this.DepartmentRepository,
    );
    this.schools = new MongoGenericRepository<School>(this.SchoolRepository);
    this.settings = new MongoGenericRepository<Setting>(this.SettingRepository);
    this.courses = new MongoGenericRepository<Course>(this.CourseRepository);
    this.teacherEnrolledCourses =
      new MongoGenericRepository<TeacherEnrolledCourse>(
        this.TeacherEnrolledCourseRepository,
      );
  }
}
