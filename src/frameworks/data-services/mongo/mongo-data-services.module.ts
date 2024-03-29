import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IDataServices } from '../../../core';
import {
  Course,
  CourseSchema,
  Department,
  DepartmentSchema,
  School,
  SchoolSchema,
  Setting,
  SettingSchema,
  StudentEnrolledCourse,
  StudentEnrolledCourseSchema,
  TeacherEnrolledCourse,
  TeacherEnrolledCourseSchema,
  User,
  UserSchema,
} from './model';
import { MongoDataServices } from './mongo-data-services.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: Course.name, schema: CourseSchema },
      { name: TeacherEnrolledCourse.name, schema: TeacherEnrolledCourseSchema },
      { name: StudentEnrolledCourse.name, schema: StudentEnrolledCourseSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
  ],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}
