import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TeacherEnrolledCourseDocument =
  HydratedDocument<TeacherEnrolledCourse>;
@Schema({ timestamps: true })
export class TeacherEnrolledCourse {
  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  teacher: mongoose.Types.ObjectId;

  @Prop({
    ref: 'Course',
    type: mongoose.Schema.Types.ObjectId,
  })
  course: mongoose.Types.ObjectId;
}

export const TeacherEnrolledCourseSchema = SchemaFactory.createForClass(
  TeacherEnrolledCourse,
);
