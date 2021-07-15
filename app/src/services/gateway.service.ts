// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { RadioServiceI, CommonServiceI, GatewayServiceI, IoTServiceI, RuleServiceI } from './types';
import { SystemInfo } from '../models';
import fetch from 'cross-fetch';

@bind({scope: BindingScope.TRANSIENT})
export class GatewayService implements GatewayServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.RADIO_SERVICE) private radioService: RadioServiceI,
    @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI,
    @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI,
  ) {}

  
  async initGateway(): Promise<void>{
    console.log(' IN GatewayService.onStart: >>>>>> ');
    const systemInfo = await this.getSystemInformation({});
    await this.iotService.initService();
    if(systemInfo && systemInfo.other && systemInfo.other.internetAvailable){
      await this.syncWithCloud();
    }
    await this.radioService.initRadio();    
  }
  
  async syncWithCloud(): Promise<void> {
    // throw new Error("Method not implemented.");
    console.log('FETCH GATEWAY CONFIGURATIONS: >>> ');
    console.log('FETCH CONNECTED DEVICES LIST: >>> ');
    console.log('FETCH RULES FOR SENSORS DATA: >>> ');
    // await this.syncRules({});
  }

  async syncRules(config: any): Promise<void> {    
    try{
            const rules = await this.iotService.fetchRules({});
            console.log('RULES: >> ', rules);
            this.ruleService.formatNAddRules(rules);
        } catch(err){
            console.log("Error in syncRules: >>>>>>> ");
            console.log(err);
        }
  }

  async getSystemInformation(valueObject: any): Promise<SystemInfo>{   
    let systemInfo = await this.commonService.getSystemInformation(valueObject);
    if(!systemInfo.other){
      systemInfo.other = {};
    }
    systemInfo.other.radioAvailable = this.radioService.isAvailable();
    delete systemInfo.internet;
    return systemInfo;
  }

  async getSystemDetails(): Promise<any>{   
    let systemInfo = await this.commonService.getSystemDetails();
    return systemInfo;
  }

}
