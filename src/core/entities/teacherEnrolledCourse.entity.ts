import { Types } from 'mongoose';
export class TeacherEnrolledCourse {
  teacher: Types.ObjectId;

  course: Types.ObjectId;
}
