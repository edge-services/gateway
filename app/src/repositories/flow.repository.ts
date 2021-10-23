import {DefaultCrudRepository} from '@loopback/repository';
import {Flow, FlowRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FlowRepository extends DefaultCrudRepository<
  Flow,
  typeof Flow.prototype.id,
  FlowRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(Flow, dataSource);
  }
}
