import {DefaultCrudRepository} from '@loopback/repository';
import {EntityCategory, EntityCategoryRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EntityCategoryRepository extends DefaultCrudRepository<
  EntityCategory,
  typeof EntityCategory.prototype.id,
  EntityCategoryRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(EntityCategory, dataSource);
  }
}
