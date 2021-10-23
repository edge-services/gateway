import {DefaultCrudRepository} from '@loopback/repository';
import {EntityData, EntityDataRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EntityDataRepository extends DefaultCrudRepository<
  EntityData,
  typeof EntityData.prototype.id,
  EntityDataRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(EntityData, dataSource);
  }
}
