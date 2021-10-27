import {DataType, EntityData} from '../models';
import {EntityDataDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {InfluxDB,  Point } from '@influxdata/influxdb-client';

export class EntityDataRepository {

  client: InfluxDB;

  constructor(
    @inject('datasources.entity-data') private dataSource: EntityDataDataSource,
  ) {
    this.client = dataSource.client
  }

  async insert(entityDataList: EntityData[]): Promise<any>{
    if(!entityDataList || entityDataList.length == 0){
        return Promise.reject('Nothing to save for EntityData !');
    }
    // console.log('IN EntityDataRepository.insert, entityData count >> ', entityDataList.length);
    const writeApi = this.client.getWriteApi(this.dataSource.defaultConfig.org, this.dataSource.defaultConfig.bucket);

    const point = new Point('entityData');
    entityDataList.forEach(entityData => {      
      point.tag('entityId', entityData.entityId)
      .tag('entityType', entityData.entityType)
      .tag('entityCategoryId', entityData.entityCategoryId);
      point.timestamp(entityData.ts || new Date().getTime());        
      point.fields[entityData.attributeKey] = entityData.attributeValue; 
    });
    // console.log(point);
    writeApi.writePoint(point); 
   
    writeApi
        .close()
        .then(() => {
            // console.log('WRITE FINISHED');
            Promise.resolve();
        })
        .catch(e => {
            console.error(e)
            console.log('\\nFinished ERROR');
            Promise.reject(e);
        });

  }

}
