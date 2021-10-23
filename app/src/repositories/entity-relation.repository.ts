import {DefaultCrudRepository} from '@loopback/repository';
import {EntityRelation, EntityRelationRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EntityRelationRepository extends DefaultCrudRepository<
  EntityRelation,
  typeof EntityRelation.prototype.id,
  EntityRelationRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(EntityRelation, dataSource);
  }
}
