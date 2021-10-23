import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './default.datasource.json';

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MemoryDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'memory';

  constructor(
    @inject('datasources.config.memory', {optional: true})
    dsConfig: object = config,
  ) {

    // const dbFile = process.env.DB_FILE ? process.env.DATA_DIR : './data/db.json';
    // console.log('DB_FILE: >> ', dbFile);

    dsConfig = {
        name: 'db',
        connector: 'memory',
        localStorage: '',
        file: process.env.DB_FILE || './data/db.json'
      };

    super(dsConfig);
  }
}
