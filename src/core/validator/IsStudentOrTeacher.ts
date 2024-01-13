import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { RolesEnum } from '../interfaces/user.interfaces';

@ValidatorConstraint({ name: 'IsStudent', async: false })
export class IsStudent implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { object } = args;

    const otherFieldValue = object['role'];

    if (otherFieldValue !== RolesEnum.Student) {
      if (value === undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      const year = new Date().getFullYear();
      if (value >= year) {
        return true;
      } else {
        return false;
      }
    }
  }

  defaultMessage(args: ValidationArguments) {
    if (JSON.parse(JSON.stringify(args.object)).role !== RolesEnum.Student) {
      return 'Please exclude this field not a student';
    } else {
      return `${args.property} should be a valid number greater than or equal to current year`;
    }
  }
}
