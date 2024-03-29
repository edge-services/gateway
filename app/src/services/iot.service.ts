// import { SystemInfo } from './../models/system-info.model';
import { bind, inject, BindingScope } from '@loopback/core';
import { ServiceBindings } from '../keys';
import { AuthServiceI, CommonServiceI, IoTServiceI, RuleServiceI } from './types';
import fetch from 'cross-fetch';
import { AttributeRepository, DeviceRepository, ETLFunctionRepository, RuleRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { Attribute, Device, EntityType, ETLFunction, Rule } from '../models';

@bind({ scope: BindingScope.SINGLETON })
export class IoTService implements IoTServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.AUTH_SERVICE) private authService: AuthServiceI,
    @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI,
    @repository(DeviceRepository) public deviceRepository: DeviceRepository,
    @repository(AttributeRepository) public attributeRepository: AttributeRepository,
    @repository(RuleRepository) public ruleRepository: RuleRepository,
    @repository(ETLFunctionRepository) public etlFunctionRepository: ETLFunctionRepository,
  ) { }

  headers: any;

  async initService(): Promise<void> {
    console.log(' IN IoTService.initService: >>>>>> ');
  }

  async syncWithCloud(): Promise<any> {
    const isOnline = await this.commonService.getItemFromCache('isOnline');
    console.log('IN IoTService.syncWithCloud, isOnline: >>>> ', isOnline);
    if (isOnline) {
      await this.fetchAuthToken();
    }

    const thisDevice: Device = await this.fetchCurrentDeviceData(isOnline);
    console.log('thisDevice: >>>> ', thisDevice);
    if (thisDevice && thisDevice.metadata.accountId) {
      const deviceCategoryIds = await this.syncDevices(thisDevice.metadata.accountId, isOnline);
      await this.syncAttributes(thisDevice.metadata.accountId, deviceCategoryIds, isOnline);
      await this.syncETLFunctions(thisDevice.metadata.accountId, deviceCategoryIds, isOnline);
      const rules = await this.syncRules(thisDevice.metadata.accountId, deviceCategoryIds, isOnline);
      console.log('Rules Loaded count after sync: >> ', rules.length);
      await this.ruleService.formatNAddRules(rules);
    }
    return Promise.resolve('COMPLETED');
  }

  private async fetchAuthToken(): Promise<void> {
    let tokenData = await this.commonService.getItemFromCache('token');
    // console.log('In fetchAuthToken, tenantId: ', process.env.TENANT_ID, ', tokenData: ', tokenData);
    if (tokenData && process.env.TENANT_ID) {
      tokenData = await this.authService.refreshAuthToken(process.env.TENANT_ID, tokenData.principal.id, tokenData.refreshToken);
      console.log('TOKEN REFRESHED >>>>>>> ');
    } else {
      if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
        // console.log('In IoTService.fetchAuthToken: >> ');
        tokenData = await this.authService.getClientToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
      }
    }
    await this.commonService.setItemInCache('token', tokenData);
    await this.setHeader(tokenData.token);
    Promise.resolve();
  }

  private async setHeader(access_token: string): Promise<void> {
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (access_token) {
      this.headers['Authorization'] = 'Bearer ' + access_token;
    }

  }

  private async syncDevices(accountId: string, isOnline: boolean): Promise<string[]> {
    const filter = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        "metadata.accountId": accountId
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
    };

    const devices: any[] = await this.fetchDevices(filter, isOnline);
    let deviceCategoryIds: Set<string> = new Set();
    if (devices && devices.length > 0) {
      devices.forEach(async device => {
        deviceCategoryIds.add(device.metadata.entityCategoryId);
        let deviceExists: boolean = await this.deviceRepository.exists(device.id);
        if (deviceExists) {
          // await this.deviceRepository.replaceById(device.id, device);
          await this.deviceRepository.updateById(device.id, device);
        } else {
          await this.deviceRepository.create(device);
        }
      });
    }

    return Array.from(deviceCategoryIds.values());

  }

  private async syncAttributes(accountId: string, deviceCategoryIds: string[], isOnline: boolean): Promise<Attribute[]> {
    const filter = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        // "metadata.accountId": accountId,
        "metadata.entityType": "DEVICE",
        "metadata.entityCategoryId": { "inq": deviceCategoryIds }
      },
      "offset": 0,
      "limit": 500,
      "skip": 0
    };
    // console.log('syncAttributes, filter: >> ', filter);
    const attributes: Attribute[] = await this.fetchAttributes(EntityType.DEVICE, filter, isOnline);
    if (isOnline && attributes && attributes.length > 0) {
      attributes.forEach(async attribute => {
        let attributeExists: boolean = await this.attributeRepository.exists(attribute.id);
        if (attributeExists) {
          // await this.attributeRepository.replaceById(attribute.id, attribute);
          await this.attributeRepository.updateById(attribute.id, attribute);

          // if (attribute.key == 'lux') {
          //   console.log('Attributes Replaced In DB: >> ', attribute);
          // }
        } else {
          await this.attributeRepository.create(attribute);
        }
      });
      console.log('Attributes Loaded count: >> ', attributes.length);
    }

    return attributes;

  }


  private async syncRules(accountId: string, deviceCategoryIds: string[], isOnline: boolean): Promise<Rule[]> {
    const filter = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        // "metadata.accountId": accountId,
        "metadata.entityType": "DEVICE",
        "metadata.entityCategoryId": { "inq": deviceCategoryIds }
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
    };

    const rules: any[] = await this.fetchRules(filter, isOnline);
    if (isOnline && rules && rules.length > 0) {
      rules.forEach(async rule => {
        let ruleExists: boolean = await this.ruleRepository.exists(rule.id);
        if (ruleExists) {
          // await this.ruleRepository.replaceById(rule.id, rule);
          await this.ruleRepository.updateById(rule.id, rule);
        } else {
          await this.ruleRepository.create(rule);
        }
      });
      console.log('Rules Loaded count: >> ', rules.length);
    }

    return rules;

  }

  private async syncETLFunctions(accountId: string, deviceCategoryIds: string[], isOnline: boolean): Promise<ETLFunction[]> {
    const filter = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        // "metadata.accountId": accountId,
        "metadata.entityType": "DEVICE",
        "metadata.entityCategoryId": { "inq": deviceCategoryIds }
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
    };

    const etlFunctions: any[] = await this.fetchETLFunctions(filter, isOnline);
    if (isOnline && etlFunctions && etlFunctions.length > 0) {
      etlFunctions.forEach(async etlFunction => {
        let etlFunctionExists = await this.etlFunctionRepository.exists(etlFunction.id);
        if (etlFunctionExists) {
          // await this.etlFunctionRepository.replaceById(etlFunction.id, etlFunction);
          await this.etlFunctionRepository.updateById(etlFunction.id, etlFunction);
        } else {
          await this.etlFunctionRepository.create(etlFunction);
        }
      });

      console.log('ETLFunctions Loaded count: >> ', etlFunctions.length);
    }
    return etlFunctions;
  }

  private async fetchCurrentDeviceData(isOnline: boolean): Promise<Device> {
    let gatewayDevice: any;
    const filter = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        "deviceSerialNo": await this.commonService.getSerialNumber()
      },
      "offset": 0,
      "limit": 10,
      "skip": 0
    };

    const devices: any[] = await this.fetchDevices(filter, isOnline);
    if (devices && devices.length > 0) {
      const thisDevice = devices[0];
      gatewayDevice = thisDevice;
      this.commonService.setItemInCache('thisDevice', thisDevice);
      if (isOnline) {
        const deviceExists = await this.deviceRepository.exists(thisDevice.id);
        if (deviceExists) {
          // await this.deviceRepository.replaceById(thisDevice.id, thisDevice);
          await this.deviceRepository.updateById(thisDevice.id, thisDevice);
        } else {
          await this.deviceRepository.create(thisDevice);
        }
      }
      // console.log('gatewayDevice: >> ', gatewayDevice);      
    }
    return Promise.resolve(gatewayDevice);
  }

  async fetchDevices(filter: any, isOnline: boolean): Promise<any> {
    if (!isOnline) {
      return this.deviceRepository.find(filter);
    } else {
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

  async fetchAttributes(entityType: EntityType, filter: any, isOnline: boolean): Promise<Attribute[]> {
    // console.log('IN fetchAttributes: >> Filter: ', JSON.stringify(filter));
    if (!isOnline) {
      return this.attributeRepository.find(filter);
    } else {
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

  async fetchETLFunctions(filter: any, isOnline: boolean): Promise<any> {
    // console.log('IN fetchETLFunctions: >> Filter: ', filter);
    if (!isOnline) {
      return this.etlFunctionRepository.find(filter);
    } else {
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

  async fetchRules(filter: any, isOnline: boolean): Promise<any> {
    console.log('IN fetchRules: >> Filter: ', JSON.stringify(filter.where));
    if (!isOnline) {
      return this.ruleRepository.find(filter);
    } else {
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

  async getMetaData(payload: any): Promise<any> {
    // const isOnline: boolean = await this.commonService.getItemFromCache('isOnline');
    //TODO: Return Entity Metadata. For eg. entityCategoryId, entity Attributes
    return false;
  }


}
