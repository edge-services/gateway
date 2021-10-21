import {DefaultCrudRepository} from '@loopback/repository';
import {Device, DeviceRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DeviceRepository extends DefaultCrudRepository<
  Device,
  typeof Device.prototype.id,
  DeviceRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Device, dataSource);
  }
}
