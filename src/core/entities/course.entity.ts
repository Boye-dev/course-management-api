import { Types } from 'mongoose';

export class Course {
  name: string;

  department: Types.ObjectId;

  yearTaken: number;

  code: string;

  units: number;
}

export enum CourseEnum {
  name = 'name',

  department = 'department',

  yearTaken = 'yearTaken',

  code = 'code',

  units = 'units',
}
