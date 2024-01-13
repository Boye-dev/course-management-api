import { Types } from 'mongoose';

export class Setting {
  registrationAllowed: Record<string, Record<string, Date>>;

  updatedBy: Types.ObjectId;
}
