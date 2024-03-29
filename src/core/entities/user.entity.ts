import { Types } from 'mongoose';
import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
  StatusEnum,
} from 'src/core/interfaces/user.interfaces';

export class User {
  _id: Types.ObjectId;

  firstName: string;

  middleName: string;

  phoneNumber: string;

  lastName: string;

  address: string;

  gender: GenderEnum;

  profilePicture: string;

  dateOfBirth: Date;

  relationshipStatus: RelationshipStatusEnum;

  verified: boolean;

  status: StatusEnum;

  email: string;

  password: string;

  role: RolesEnum;

  nationality: string;

  state: string;

  lga: string;

  department?: Types.ObjectId;

  registrationStatus?: Record<string, string[]>;

  yearOfAdmission?: number;

  verificationToken: string;

  otpToken: number;

  otpTokenExpires: Date;

  resetPasswordToken: string;

  resetPasswordExpires: Date;
}
