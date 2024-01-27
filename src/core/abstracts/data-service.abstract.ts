import { IGenericRepository } from './generic-repository.abstract';
import {
  Course,
  Department,
  School,
  Setting,
  TeacherEnrolledCourse,
  User,
} from '../entities';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract schools: IGenericRepository<School>;
  abstract departments: IGenericRepository<Department>;
  abstract settings: IGenericRepository<Setting>;
  abstract courses: IGenericRepository<Course>;
  abstract teacherEnrolledCourses: IGenericRepository<TeacherEnrolledCourse>;
}
