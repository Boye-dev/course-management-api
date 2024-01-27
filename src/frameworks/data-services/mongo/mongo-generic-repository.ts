import { HydratedDocument, Model } from 'mongoose';
import { IGenericRepository } from '../../../core';
import { QueryDto } from 'src/core/dto/query.dto';
import { Types } from 'mongoose';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
  private _repository: Model<T>;

  constructor(repository: Model<T>) {
    this._repository = repository;
  }

  async findAll(param?: QueryDto, populate?: any) {
    const page = param?.page - 1 || 0;
    const pageSize = param?.pageSize || 10;

    const search = param?.search || '';
    const searchBy = param?.searchBy || [];
    const searchObject = [];

    for (const option of searchBy) {
      const optionObj = {};
      optionObj[option] = { $regex: search, $options: 'i' };
      searchObject.push(optionObj);
    }

    const findOperation = param?.findOperation;

    const sortBy = param?.sortBy || null;

    let total: number;
    if (searchObject.length > 0) {
      total = await this._repository.countDocuments({
        $and: [{ $or: searchObject }, { ...findOperation }],
      });
      if (populate) {
        const data = await this._repository
          .find({ $and: [{ $or: searchObject }, { ...findOperation }] })
          .sort({
            [sortBy]:
              param?.sortOrder === 'asc'
                ? 1
                : param?.sortOrder === 'desc'
                  ? -1
                  : 1,
          })
          .skip(page * pageSize)
          .limit(pageSize)
          .populate(populate);
        return { total, page, pageSize, data };
      }
      const data = await this._repository
        .find({ $and: [{ $or: searchObject }, { ...findOperation }] })
        .sort({
          [sortBy]:
            param?.sortOrder === 'asc'
              ? 1
              : param?.sortOrder === 'desc'
                ? -1
                : 1,
        })
        .skip(page * pageSize)
        .limit(pageSize);
      return { total, page, pageSize, data };
    } else {
      total = await this._repository.countDocuments({
        ...findOperation,
      });
      if (populate) {
        const data = await this._repository
          .find({ ...findOperation })
          .sort({
            [sortBy]:
              param?.sortOrder === 'asc'
                ? 1
                : param?.sortOrder === 'desc'
                  ? -1
                  : 1,
          })
          .skip(page * pageSize)
          .limit(pageSize)
          .populate(populate);
        return { total, page, pageSize, data };
      }
      const data = await this._repository
        .find({ ...findOperation })
        .sort({
          [sortBy]:
            param?.sortOrder === 'asc'
              ? 1
              : param?.sortOrder === 'desc'
                ? -1
                : 1,
        })
        .skip(page * pageSize)
        .limit(pageSize);
      return { total, page, pageSize, data };
    }
  }

  findById(id: Types.ObjectId): Promise<HydratedDocument<T>> {
    return this._repository.findById(id);
  }

  findOne(param: any): Promise<HydratedDocument<T>> {
    return this._repository.findOne(param);
  }
  create(item: T): Promise<HydratedDocument<T>> {
    return this._repository.create(item);
  }

  insertMany(item: T[]) {
    return this._repository.insertMany(item);
  }

  update(id: Types.ObjectId, item: T): Promise<HydratedDocument<T>> {
    return this._repository.findByIdAndUpdate(id, item, {
      new: true,
    });
  }
  delete(id: Types.ObjectId) {
    return this._repository.findByIdAndDelete(id);
  }
}
