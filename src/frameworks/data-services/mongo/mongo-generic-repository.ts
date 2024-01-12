import { HydratedDocument, Model } from 'mongoose';
import { IGenericRepository } from '../../../core';
import { QueryDto } from 'src/core/dto/query.dto';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
  private _repository: Model<T>;
  private _populateOnFind: string[];

  constructor(repository: Model<T>, populateOnFind: string[] = []) {
    this._repository = repository;
    this._populateOnFind = populateOnFind;
  }

  async findAll(param: QueryDto) {
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
        $or: searchObject,
        ...findOperation,
      });
      const data = await this._repository
        .find({ $or: searchObject, ...findOperation })
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

  findById(id: string): Promise<HydratedDocument<T>> {
    return this._repository.findById(id);
  }

  findOne(param: Partial<T>): Promise<HydratedDocument<T>> {
    return this._repository.findOne(param);
  }
  create(item: T): Promise<T> {
    return this._repository.create(item);
  }

  update(id: string, item: T) {
    this._repository;
    return this._repository.findByIdAndUpdate(id, item, {
      new: true,
    });
  }
  delete(id: string) {
    return this._repository.findByIdAndDelete(id);
  }
}
