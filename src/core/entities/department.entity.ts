import { Types } from 'mongoose';

export class Department {
  name: string;

  school: Types.ObjectId;

  yearsTaken: number;

  code: string;
}

export enum DepartmentEnum {
  name = 'name',

  school = 'school',

  yearsTaken = 'yearsTaken',

  code = 'code',
}
