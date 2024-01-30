import { Types } from 'mongoose';
export class StudentEnrolledCourse {
  course: Types.ObjectId;

  student: Types.ObjectId;

  score: number;

  year: string;
}
