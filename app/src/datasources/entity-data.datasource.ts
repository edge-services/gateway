import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import * as dotenv from "dotenv";
import { InfluxDB } from '@influxdata/influxdb-client';

dotenv.config();
let env_path = process.env.NODE_ENV;
if (env_path) {
  dotenv.config({ path: env_path });
}

const config = {
  'url': process.env.INFLUXDB_URL,
  'token': process.env.INFLUXDB_TOKEN,
  'org': process.env.INFLUXDB_ORG || 'IBM',
  'bucket': process.env.INFLUXDB_BUCKET || 'smartthings'
};

@lifeCycleObserver('datasource')
export class EntityDataDataSource implements LifeCycleObserver {
  static dataSourceName = 'entity-data';
  //   static readonly defaultConfig = config;
  defaultConfig = config;
  client: InfluxDB;


  constructor(
    @inject('datasources.config.entity-data', { optional: true })
    dsConfig: object = config,
  ) {
    dsConfig = config;
    this.init();
  }

  init(): Promise<any> {
    if (config && config.url) {
      this.client = new InfluxDB({
        url: config.url,
        token: config.token
      });
      return Promise.resolve(this.client);
    } else {
      return Promise.reject("InfluxDB Config missing");
      // return Promise.resolve(this.client);
    }
  }

}
