import { HydratedDocument } from 'mongoose';

export abstract class IGenericRepository<T> {
  abstract findAll(param?: any);

  abstract findById(id: string): Promise<HydratedDocument<T>>;

  abstract findOne(param: Partial<T>): Promise<HydratedDocument<T>>;

  abstract create(item: T): Promise<T>;

  abstract update(id: string, item: Partial<T>);

  abstract delete(id: string);
}
