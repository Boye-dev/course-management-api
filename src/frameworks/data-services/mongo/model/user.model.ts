import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
  StatusEnum,
} from 'src/core/interfaces/user.interfaces';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, trim: true })
  gender: GenderEnum;

  @Prop({ required: true })
  profilePicture: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  relationshipStatus: RelationshipStatusEnum;

  @Prop({ default: false })
  verified: boolean;

  @Prop({
    unique: true,
    required: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true, maxlength: 255 })
  password: string;

  @Prop({ required: true })
  role: RolesEnum;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  lga: string;

  @Prop({
    ref: 'Department',
    type: mongoose.Schema.Types.ObjectId,
    default: undefined,
  })
  department?: mongoose.Types.ObjectId;

  @Prop()
  yearOfAdmission?: number;

  @Prop({ required: true })
  status: StatusEnum;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: undefined })
  registrationStatus?: Record<string, string[]>;

  @Prop()
  otpToken: string;

  @Prop()
  otpTokenExpires: Date;

  @Prop()
  verificationToken: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
