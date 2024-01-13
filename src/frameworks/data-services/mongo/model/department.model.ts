import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DepartmentDocument = HydratedDocument<Department>;
@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, trim: true, unique: true, lowercase: true })
  name: string;

  @Prop({
    ref: 'School',
    type: mongoose.Schema.Types.ObjectId,
    default: undefined,
    required: true,
  })
  school: Types.ObjectId;

  @Prop({ required: true })
  yearsTaken: number;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
