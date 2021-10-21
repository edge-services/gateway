// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { AuthServiceI, CommonServiceI, IoTServiceI } from './types';
import fetch from 'cross-fetch';
import { AttributeRepository, DeviceRepository, ETLFunctionRepository, RuleRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { Device, EntityType } from '../models';

@bind({scope: BindingScope.SINGLETON})
export class IoTService implements IoTServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.AUTH_SERVICE) private authService: AuthServiceI,
    @repository(DeviceRepository) public deviceRepository : DeviceRepository, 
    @repository(AttributeRepository) public attributeRepository : AttributeRepository, 
    @repository(RuleRepository) public ruleRepository : RuleRepository, 
    @repository(ETLFunctionRepository) public etlFunctionRepository : ETLFunctionRepository,  
  ) {}

  headers: any;
  
  async initService(): Promise<void>{
    console.log(' IN IoTService.initService: >>>>>> ');       
  }

  async syncWithCloud(): Promise<void> {
    await this.fetchAuthToken();
    const thisDevice: Device = await this.fetchCurrentDeviceData();
    if(thisDevice && thisDevice.accountId){
      const deviceCategoryIds = await this.syncDevices(thisDevice.accountId);
      await this.syncAttributes(thisDevice.accountId, deviceCategoryIds);
      await this.syncRules(thisDevice.accountId, deviceCategoryIds);
      await this.syncETLFunctions(thisDevice.accountId, deviceCategoryIds);      
    }
    
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

  private async syncDevices(accountId: string): Promise<string[]> {
    const filter = {
      "where": {
          "tenantId": process.env.TENANT_ID,
          "accountId": accountId
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
      };
    
      const devices: any[] = await this.fetchDevices(filter, false);
      let deviceCategoryIds: string[] = [];
      if(devices && devices.length > 0){
        devices.forEach(async device => {
          deviceCategoryIds.push(device.deviceCategoryId);
          let deviceExists: boolean = await this.deviceRepository.exists(device.id);
          if (deviceExists){
            await this.deviceRepository.replaceById(device.id, device);
          }else{
            await this.deviceRepository.create(device);
          }
        });        
      }

      return deviceCategoryIds;

  }

  private async syncAttributes(accountId: string, deviceCategoryIds: string[]): Promise<void> {
    const filter = {
      "where": {
          "tenantId": process.env.TENANT_ID,
          "accountId": accountId,
          "entityType": "DEVICE",
          "entityCategoryId": {"inq": deviceCategoryIds}
      },
      "offset": 0,
      "limit": 500,
      "skip": 0
      };
    
      const attributes: any[] = await this.fetchAttributes(EntityType.DEVICE, filter, false);
      if(attributes && attributes.length > 0){
        attributes.forEach(async attribute => {
          let attributeExists: boolean = await this.attributeRepository.exists(attribute.id);
          if (attributeExists){
            await this.attributeRepository.replaceById(attribute.id, attribute);
          }else{
            await this.attributeRepository.create(attribute);
          }
        });        
      }

  }


  private async syncRules(accountId: string, deviceCategoryIds: string[]): Promise<void> {
    const filter = {
      "where": {
          "tenantId": process.env.TENANT_ID,
          "accountId": accountId,
          "metadata.entityType": "DEVICE",
          "metadata.entityCategoryId": {"inq": deviceCategoryIds}
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
      };
    
      const rules: any[] = await this.fetchRules(filter, false);
      if(rules && rules.length > 0){
        rules.forEach(async rule => {
          let ruleExists: boolean = await this.ruleRepository.exists(rule.id);
          if (ruleExists){
            await this.ruleRepository.replaceById(rule.id, rule);
          }else{
            await this.ruleRepository.create(rule);
          }
        });        
      }

  }

  private async syncETLFunctions(accountId: string, deviceCategoryIds: string[]): Promise<void> {
    const filter = {
      "where": {
          "tenantId": process.env.TENANT_ID,
          "accountId": accountId,
          "metadata.entityType": "DEVICE",
          "metadata.entityCategoryId": {"inq": deviceCategoryIds}
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
      };
    
      const etlFunctions: any[] = await this.fetchETLFunctions(filter, false);
      if(etlFunctions && etlFunctions.length > 0){
        etlFunctions.forEach(async etlFunction => {
          let etlFunctionExists = await this.etlFunctionRepository.exists(etlFunction.id);
          if (etlFunctionExists){
            await this.etlFunctionRepository.replaceById(etlFunction.id, etlFunction);
          }else{
            await this.etlFunctionRepository.create(etlFunction);
          }
        });        
      }

  }

  private async fetchCurrentDeviceData(): Promise<Device>{
    let gatewayDevice: any;
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
      const thisDevice = devices[0];
      const deviceExists = await this.deviceRepository.exists(thisDevice.id);
      if (deviceExists){
         await this.deviceRepository.replaceById(thisDevice.id, thisDevice);
      }else{
         await this.deviceRepository.create(thisDevice);
      }
      
      this.commonService.setItemInCache('thisDevice', thisDevice);
      // console.log('gatewayDevice: >> ', gatewayDevice);      
    }
    return gatewayDevice;
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
    // console.log('IN fetchDevices: >> Filter: ', filter);
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

  async fetchAttributes(entityType: EntityType, filter: any, local: boolean): Promise<any> {
    // console.log('IN fetchAttributes: >> Filter: ', JSON.stringify(filter.where));
    if(local){
      //TODO: Fetch data from local DB
    }else{
      // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
      const params = JSON.stringify(filter);
      const IOT_SVC_URL = `${process.env.IOT_API_URL}/${process.env.TENANT_ID}/${entityType}/attributes?filter=${params}`;
      const response = await fetch(IOT_SVC_URL, {
          method: 'GET',
          headers: this.headers
      });      
      return response.json();
    }       
  }

  async fetchETLFunctions(filter: any, local: boolean): Promise<any> {
    // console.log('IN fetchETLFunctions: >> Filter: ', filter);
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
    console.log('IN fetchRules: >> Filter: ', JSON.stringify(filter.where));
    if(local){
      //TODO: Fetch data from local DB
    }else{
      // Object.keys(filter).forEach(key => IOT_SVC_URL.searchParams.append(key, filter[key]))
      const params = JSON.stringify(filter);
      const IOT_SVC_URL = `${process.env.IOT_API_URL}/${process.env.TENANT_ID}/rules?filter=${params}`;
      const response = await fetch(IOT_SVC_URL, {
          method: 'GET',
          headers: this.headers
      });      
      return response.json();
    }       
  }


}
