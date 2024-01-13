import { IGenericRepository } from './generic-repository.abstract';
import { Department, School, Setting, User } from '../entities';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract schools: IGenericRepository<School>;
  abstract departments: IGenericRepository<Department>;
  abstract settings: IGenericRepository<Setting>;
}
