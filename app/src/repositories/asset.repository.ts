import {Asset, AssetRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import { DefaultUserModifyCrudRepository } from './default-user-modify-crud.repository.base';

export class AssetRepository extends DefaultUserModifyCrudRepository<
  Asset,
  typeof Asset.prototype.id,
  AssetRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MongodbDataSource,
  ) {
    super(Asset, dataSource);
  }
}
