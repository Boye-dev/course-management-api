import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CourseDocument = HydratedDocument<Course>;
@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true, unique: true, lowercase: true })
  name: string;

  @Prop({
    ref: 'Department',
    type: mongoose.Schema.Types.ObjectId,
  })
  department: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  code: string;

  @Prop({ required: true })
  yearTaken: number;

  @Prop({ required: true })
  units: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
