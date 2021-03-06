import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './default.datasource.json';

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongodb';

  constructor(
    @inject('datasources.config.mongodb', {optional: true})
    dsConfig: object = config,
  ) {

    let dbPassword = process.env.DB_PASSWORD;
    if(process.env.DB_PASSWORD){
      dbPassword = encodeURIComponent(process.env.DB_PASSWORD);      
    }
    
    dsConfig = {
      name: 'mongodb',
      connector: process.env.DB_CONNECTOR,
      // url: process.env.DB_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: dbPassword,
      database: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      'plugin': 'retry',
      'retryAttempts': 3,
      'retryTimeout': 1000,
      writeConcern: {
        j: true
      }
    };

    super(dsConfig);
  }
}
