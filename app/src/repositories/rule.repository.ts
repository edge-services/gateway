import {DefaultCrudRepository} from '@loopback/repository';
import {Rule, RuleRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class RuleRepository extends DefaultCrudRepository<
  Rule,
  typeof Rule.prototype.id,
  RuleRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(Rule, dataSource);
  }
}
