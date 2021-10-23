import {DefaultCrudRepository} from '@loopback/repository';
import {ETLFunction, ETLFunctionRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ETLFunctionRepository extends DefaultCrudRepository<
  ETLFunction,
  typeof ETLFunction.prototype.id,
  ETLFunctionRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(ETLFunction, dataSource);
  }
}
