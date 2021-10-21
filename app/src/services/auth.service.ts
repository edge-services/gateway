import {injectable, /* inject, */ BindingScope, inject, Provider, ValueOrPromise} from '@loopback/core';
import { getService } from '@loopback/service-proxy';
import { AuthServiceI } from '.';
import { AuthDataSource } from '../datasources';

// @injectable({scope: BindingScope.TRANSIENT})
export class AuthServiceProvider implements Provider<AuthServiceI>  {
  constructor(
    @inject('datasources.auth') protected dataSource: AuthDataSource
    ) {}


  value(): Promise<AuthServiceI> {
    return getService(this.dataSource);
  }


}
