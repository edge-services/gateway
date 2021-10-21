import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from "dotenv";

dotenv.config();
    let env_path = process.env.NODE_ENV;
    if(env_path){
      dotenv.config({ path: env_path });
    } 

const config = {
  name: 'auth',
  connector: 'rest',
  baseURL: process.env.AUTH_API_URL,
  crud: false,
  options: {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
    },
  },
  operations: [
    {
      template: {
        method: 'POST',
        url: `${process.env.AUTH_API_URL}/${process.env.TENANT_ID}/clients/token`,
        body: {
          "clientId": "{clientId:string}",
          "secret": "{secret:string}"
        }
      },
      functions: {
        getClientToken: ['clientId', 'secret']
      },
    },
    {
      template: {
        method: 'POST',
        url: `${process.env.AUTH_API_URL}/${process.env.TENANT_ID}/auth/token/refresh`,
        body: {
          "tenantId": "{tenantId:string}",
          "principalId": "{principalId:string}",
          "refreshToken": "{refreshToken:string}"
        }
      },
      functions: {
        refreshAuthToken: ['tenantId', 'principalId', 'refreshToken']
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AuthDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'auth';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.auth', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
