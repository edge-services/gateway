import {DefaultCrudRepository} from '@loopback/repository';
import {Edge, EdgeRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EdgeRepository extends DefaultCrudRepository<
  Edge,
  typeof Edge.prototype.id,
  EdgeRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Edge, dataSource);
  }
}
