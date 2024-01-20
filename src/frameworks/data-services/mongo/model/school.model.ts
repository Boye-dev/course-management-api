import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SchoolDocument = HydratedDocument<School>;
@Schema({ timestamps: true })
export class School {
  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  code: string;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
