import {DefaultCrudRepository} from '@loopback/repository';
import {Attribute, AttributeRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AttributeRepository extends DefaultCrudRepository<
  Attribute,
  typeof Attribute.prototype.id,
  AttributeRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Attribute, dataSource);
  }
}
