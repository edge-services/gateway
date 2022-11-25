// import { SystemInfo } from './../models/system-info.model';
import { bind, inject, BindingScope } from '@loopback/core';
import { ServiceBindings } from '../keys';
import { RadioServiceI, CommonServiceI, GatewayServiceI, IoTServiceI, SensorTagServiceI } from './types';
import { SystemInfo } from '../models';
import fetch from 'cross-fetch';

@bind({ scope: BindingScope.SINGLETON })
export class GatewayService implements GatewayServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.RADIO_SERVICE) private radioService: RadioServiceI,
    @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI,
    @inject(ServiceBindings.SENSORTAG_SERVICE) private sensorTagService: SensorTagServiceI
  ) { }

  async initGateway(): Promise<void> {
    console.log(' IN GatewayService.onStart: >>>>>> ');
    const systemInfo = await this.getSystemInformation({});
    let isOnline = false;
    if (systemInfo && systemInfo.other && systemInfo.other.internetAvailable) {
      isOnline = systemInfo.other.internetAvailable;
    }
    await this.iotService.initService();

    console.log('systemInfo: >> ', systemInfo);
    await this.commonService.setItemInCache('isOnline', isOnline);
    // await this.commonService.setItemInCache('isOnline', false);  
    await this.syncWithCloud();
    await this.radioService.initRadio();
    await this.sensorTagService.initSensorTag();
  }

  async restartGateway(): Promise<void> {
    this.sensorTagService.clean();
    await this.syncWithCloud();
    await this.radioService.initRadio();
    await this.sensorTagService.initSensorTag();
  }

  async syncWithCloud(): Promise<void> {
    await this.commonService.setItemInCache('status', 'SYNC');
    const status = await this.iotService.syncWithCloud();
    await this.commonService.setItemInCache('status', status);
    console.log('\n\n<<<<<< SYNC COMPLETED >>>>>>\n\n');
  }

  async getSystemInformation(valueObject: any): Promise<SystemInfo> {
    let systemInfo = await this.commonService.getSystemInformation(valueObject);
    if (!systemInfo.other) {
      systemInfo.other = {};
    }
    systemInfo.other.radioAvailable = this.radioService.isAvailable();
    delete systemInfo.internet;
    return systemInfo;
  }

  async getSystemDetails(): Promise<any> {
    let systemInfo = await this.commonService.getSystemDetails();
    return systemInfo;
  }

}
