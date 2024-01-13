import { HydratedDocument, Types } from 'mongoose';

export abstract class IGenericRepository<T> {
  abstract findAll(param?: any);

  abstract findById(id: Types.ObjectId): Promise<HydratedDocument<T>>;

  abstract findOne(param: Partial<T>): Promise<HydratedDocument<T>>;

  abstract create(item: T): Promise<HydratedDocument<T>>;

  abstract update(
    id: Types.ObjectId,
    item: Partial<T>,
  ): Promise<HydratedDocument<T>>;

  abstract delete(id: Types.ObjectId);
}
