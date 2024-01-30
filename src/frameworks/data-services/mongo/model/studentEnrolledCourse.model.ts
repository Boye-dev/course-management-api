import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentEnrolledCourseDocument =
  HydratedDocument<StudentEnrolledCourse>;
@Schema({ timestamps: true })
export class StudentEnrolledCourse {
  @Prop({
    ref: 'TeacherEnrolledCourseDocument',
    type: mongoose.Schema.Types.ObjectId,
  })
  course: mongoose.Types.ObjectId;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  student: mongoose.Types.ObjectId;

  @Prop({ default: -2 })
  score: number;

  @Prop({ required: true, trim: true })
  year: string;
}

export const StudentEnrolledCourseSchema = SchemaFactory.createForClass(
  StudentEnrolledCourse,
);
