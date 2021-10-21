import { DataObject, Getter, Where, Count, DefaultCrudRepository, model, Entity } from '@loopback/repository';
import {UserModifiableEntity} from '../models/user-modifiable-entity.model';
import {juggler} from '@loopback/repository';
import { Options } from 'loopback-datasource-juggler';
import {HttpErrors} from '@loopback/rest';

export abstract class DefaultUserModifyCrudRepository<
  T extends UserModifiableEntity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource
  ) {
    super(entityClass, dataSource);
  }

  async createWOAuth(entity: DataObject<T>, options?: Options): Promise<T> {
    return super.create(entity, options);
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    return super.create(entity, options);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    return super.createAll(entities, options);
  }

  async save(entity: T, options?: Options): Promise<T> {
    return super.save(entity, options);
  }

  async update(entity: T, options?: Options): Promise<void> {
    return super.update(entity, options);
  }

  async updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    return super.updateAll(data, where, options);
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    return super.updateById(id, data, options);
  }
  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    return super.replaceById(id, data, options);
  }

}
