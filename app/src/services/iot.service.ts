// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { CommonServiceI, IoTServiceI } from './types';
import fetch from 'cross-fetch';

@bind({scope: BindingScope.TRANSIENT})
export class IoTService implements IoTServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
  ) {}

  
  async initService(): Promise<void>{
    console.log(' IN IoTService.initService: >>>>>> ');   
    const tokenResp = await this.fetchAuthToken();
    // console.log('tokenResp set: >> ', tokenResp);
    await this.commonService.setItemInCache('token', tokenResp);
  }

  async fetchAuthToken(){
    console.log('IN fetchAuthToken: ');
    // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
    if(!process.env.CLIENT_ID || !process.env.CLIENT_SECRET){
        return false;
    }

    const payload = new URLSearchParams();
    payload.append('client_id', process.env.CLIENT_ID);
    payload.append('client_secret', process.env.CLIENT_SECRET);
    payload.append('grant_type', 'client_credentials');
    const AUTH_SVC_URL = `${process.env.AUTH_SVC_ENDPOINT}/auth/realms/${process.env.TENANT_ID}/protocol/openid-connect/token`;
    const response = await fetch(AUTH_SVC_URL, {
        method: 'POST',
        body: payload.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Accept': 'application/json'
        }        
      });
      
      return response.json();

    }
  
  async fetchRules(payload: any){
        console.log('IN fetchRules: >> Payload: ', payload);
        const tokenResp = await this.commonService.getItemFromCache('token');
        if(!tokenResp && !tokenResp.access_token){
            return [];
        }

        const access_token = tokenResp.access_token
        
        const filter = {
        "where": {
            "tenantId": process.env.TENANT_ID,
            "customerId": process.env.CUSTOMER_ID
        },
        "offset": 0,
        "limit": 10,
        "skip": 0
        };
        // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
        const params = JSON.stringify(filter);
        const IOT_SVC_URL = `${process.env.IOT_SVC_ENDPOINT}/api/${process.env.TENANT_ID}/rules?filter=${params}`;
        const response = await fetch(IOT_SVC_URL, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+access_token
            } 
        });
        
        return response.json();

    }


}
