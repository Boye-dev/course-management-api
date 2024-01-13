import { Types } from 'mongoose';

export class Department {
  name: string;

  school: Types.ObjectId;

  yearsTaken: number;
}
