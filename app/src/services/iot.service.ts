// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { AuthServiceI, CommonServiceI, IoTServiceI } from './types';
import fetch from 'cross-fetch';
import { DeviceRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { Device } from '../models';

@bind({scope: BindingScope.SINGLETON})
export class IoTService implements IoTServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.AUTH_SERVICE) private authService: AuthServiceI,
    @repository(DeviceRepository)
      public deviceRepository : DeviceRepository,  
  ) {}

  headers: any;
  
  async initService(): Promise<void>{
    console.log(' IN IoTService.initService: >>>>>> ');       
  }

  async syncWithCloud(): Promise<void> {
    console.log('FETCH GATEWAY CONFIGURATIONS: >>> ');
    console.log('FETCH CONNECTED DEVICES LIST: >>> ');
    console.log('FETCH RULES FOR SENSORS DATA: >>> ');
    await this.fetchAuthToken();
    await this.syncDevices();
  }

  private async fetchAuthToken(): Promise<void> {
    let tokenData = await this.commonService.getItemFromCache('token');
    if(tokenData && process.env.TENANT_ID){
      console.log('VERIFY or REFRESH TOKEN: >> ', tokenData);
      tokenData = this.authService.refreshAuthToken(process.env.TENANT_ID, tokenData.principalId, tokenData.refreshToken);      
    }else{
      if(process.env.CLIENT_ID && process.env.CLIENT_SECRET){
        tokenData = await this.authService.getClientToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET);        
      }
    }
    this.commonService.setItemInCache('token', tokenData);
    await this.setHeader(tokenData.token);
  }

  private async setHeader(access_token: string): Promise<void>{
    this.headers =  {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
       
    if(access_token){
      this.headers['Authorization'] = 'Bearer '+access_token;
    }
         
  }

  private async syncDevices(): Promise<void> {
    const filter = {
      "where": {
          "tenantId": process.env.TENANT_ID,
          "deviceSerialNo": await this.commonService.getSerialNumber()
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
      };
    
    const devices: any[] = await this.fetchDevices(filter, false);
    if(devices && devices.length > 0){
      // devices.forEach(async device => {
      //   await this.deviceRepository.updateById(device.id, device);
      // });
      const thisDevice = devices[0];
      let gatewayDevice: Device = await this.deviceRepository.findById(thisDevice.id);
      if (gatewayDevice){
         gatewayDevice = thisDevice;
         await this.deviceRepository.updateById(thisDevice.id, thisDevice);
      }else{
         gatewayDevice = await this.deviceRepository.create(thisDevice);
      }
      
      this.commonService.setItemInCache('thisDevice', gatewayDevice);
      console.log('gatewayDevice: >> ', gatewayDevice);
      //TODO: Save Devices data in local DB
    }

  }

  // async fetchAuthToken(){
  //   console.log('IN fetchAuthToken: ');
  //   // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
  //   if(!process.env.CLIENT_ID || !process.env.CLIENT_SECRET){
  //       return false;
  //   }

  //   const payload = new URLSearchParams();
  //   payload.append('client_id', process.env.CLIENT_ID);
  //   payload.append('client_secret', process.env.CLIENT_SECRET);
  //   payload.append('grant_type', 'client_credentials');
  //   const AUTH_SVC_URL = `${process.env.AUTH_SVC_ENDPOINT}/auth/realms/${process.env.TENANT_ID}/protocol/openid-connect/token`;
  //   const response = await fetch(AUTH_SVC_URL, {
  //       method: 'POST',
  //       body: payload.toString(),
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
  //         'Accept': 'application/json'
  //       }        
  //     });
      
  //     return response.json();

  //   }

  async fetchDevices(filter: any, local: boolean): Promise<any> {
    console.log('IN fetchDevices: >> Filter: ', filter);
    if(local){
      //TODO: Fetch data from local DB
    }else{
      // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
      const params = JSON.stringify(filter);
      const IOT_SVC_URL = `${process.env.IOT_API_URL}/${process.env.TENANT_ID}/devices?filter=${params}`;
      const response = await fetch(IOT_SVC_URL, {
          method: 'GET',
          headers: this.headers
      });      
      return response.json();
    }
       
  }

  async fetchETLFunctions(filter: any, local: boolean): Promise<any> {
    console.log('IN fetchETLFunctions: >> Filter: ', filter);
    if(local){
      //TODO: Fetch data from local DB
    }else{
      // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
      const params = JSON.stringify(filter);
      const IOT_SVC_URL = `${process.env.IOT_API_URL}/${process.env.TENANT_ID}/etl-functions?filter=${params}`;
      const response = await fetch(IOT_SVC_URL, {
          method: 'GET',
          headers: this.headers
      });      
      return response.json();
    }       
  }

  async fetchRules(filter: any, local: boolean): Promise<any> {
    console.log('IN fetchRules: >> Filter: ', filter);
    if(local){
      //TODO: Fetch data from local DB
    }else{
      // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
      const params = JSON.stringify(filter);
      const IOT_SVC_URL = `${process.env.IOT_API_URL}/${process.env.TENANT_ID}/etl-functions?filter=${params}`;
      const response = await fetch(IOT_SVC_URL, {
          method: 'GET',
          headers: this.headers
      });      
      return response.json();
    }       
  }


}
