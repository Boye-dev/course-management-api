import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsMongoIdArray', async: false })
export class IsMongoIdArray implements ValidatorConstraintInterface {
  validate(values: any) {
    const isMongoId = (value: string): boolean =>
      /^[0-9a-fA-F]{24}$/.test(value);

    if (Array.isArray(values)) {
      const isValid = values.every(isMongoId);
      return isValid;
    }
    return false;
  }

  defaultMessage() {
    return `All values  must be a valid MongoDB ObjectId`;
  }
}
