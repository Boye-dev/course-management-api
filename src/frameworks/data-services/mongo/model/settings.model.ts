import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  registrationAllowed: Record<string, Record<string, Date>>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
