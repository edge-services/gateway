import { bind, inject, BindingScope } from '@loopback/core';
import { DataFlowServiceI } from '.';
import { ServiceBindings } from '../keys';
import { Attribute, AttributeType, Device, EntityType } from '../models';
import { CommonServiceI, IoTServiceI, SensorTagServiceI } from './types';

let SensorTag = require('@sinny777/ti-sensortag');

@bind({ scope: BindingScope.SINGLETON })
export class SensorTagService implements SensorTagServiceI {

  tags: any;

  constructor(
    @inject(ServiceBindings.DATA_FLOW_SERVICE) private dataFlowService: DataFlowServiceI,
    @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI,
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
  ) {
    this.tags = [];
  }

  async initSensorTag(): Promise<void> {
    try {
      let that = this;
      SensorTag.discover(async function (device: any) {
        await that.onDiscover(device);
      });

    } catch (err) {
      console.log("Error in initSensortag: >>>>>>> ");
      console.log(err);
    }
  }

  async onDiscover(sensorTag: any) {
    this.tags.push(sensorTag);
    let flowService = this.dataFlowService;
    let payload: any = { type: 'TI_SensorTag', d: {} };
    console.log('IN OnDiscover, sensorTag: >> ', sensorTag);
    try {

      SensorTag.stopDiscoverAll(await this.onDiscover);
      // sensorTag.disconnect();
      // let that = this;

      const attributes: Attribute[] = await this.fetchAttributes();
      console.log('Attributes Fetched count: >> ', attributes.length);
      const attributesMap: Map<String, Attribute> = new Map<String, Attribute>();
      if (attributes && attributes.length > 0) {
        attributes.forEach(attribute => {
          attributesMap.set(attribute.key, attribute);
        });
      }

      function disconnect() {
        console.log('Sensortag disconnected!');
        sensorTag.connectAndSetUp(enableSensors);
      }

      function resetSensorsData(payload: any) {
        payload = { type: 'TI_SensorTag', d: {} };
        if (attributesMap.get('accel_x')?.requiredAttribute) {
          payload.d.accel_x = 0.0;
          payload.d.accel_y = 0.0;
          payload.d.accel_z = 0.0;
        }
        if (attributesMap.get('press')?.requiredAttribute) {
          payload.d.pressure = 0.0;
        }
        if (attributesMap.get('magneto_x')?.requiredAttribute) {
          payload.d.magneto_x = 0.0;
          payload.d.magneto_y = 0.0;
          payload.d.magneto_z = 0.0;
        }
        // payload.gyro = {sensor: 'gyroscope'};
        if (attributesMap.get('temperature')?.requiredAttribute) {
          payload.d.temperature = 0.0;
        }
        if (attributesMap.get('hum')?.requiredAttribute) {
          payload.d.humidity = 0.0
        }
        payload.d.objectTemperature = 0.0;
        if (attributesMap.get('temperature')?.requiredAttribute) {
          payload.d.ambientTemperature = 0.0;
        }
        if (attributesMap.get('lux')?.requiredAttribute) {
          payload.d.lux = 0.0;
        }
        payload.d.keys = {};
        return payload;
      }

      function readBasicDetails(payload: any) {
        payload['uniqueId'] = sensorTag.id;
        payload['model'] = sensorTag.type;
        sensorTag.readSystemId(function (error: any, systemId: string) {
          console.log('systemId: >> ', systemId);
          payload['systemId'] = systemId;
        });
        sensorTag.readSerialNumber(function (error: any, serialNumber: string) {
          console.log('serialNumber: >> ', serialNumber);
          payload['serialNumber'] = serialNumber;
        });

        return payload;
      }

      function enableSensors(error: any) {		// attempt to enable the sensors
        console.log('Enabling sensors, any error: ', error);
        // // enable sensor:
        if (attributesMap.get('accel_x')?.requiredAttribute) {
          sensorTag.enableAccelerometer();
          console.log('Enabled enableAccelerometer');
        }
        if (attributesMap.get('press')?.requiredAttribute) {
          sensorTag.enableBarometricPressure();
          console.log('Enabled enableBarometricPressure');
        }

        // device.enableGyroscope();
        if (attributesMap.get('magneto_x')?.requiredAttribute) {
          sensorTag.enableMagnetometer();
          console.log('Enabled enableMagnetometer');
        }

        if (attributesMap.get('hum')?.requiredAttribute) {
          sensorTag.enableHumidity();
          console.log('Enabled enableHumidity');
        }

        if (attributesMap.get('temperature')?.requiredAttribute) {
          sensorTag.enableIrTemperature();
          console.log('Enabled enableIrTemperature');
        }

        if (attributesMap.get('lux')?.requiredAttribute) {
          sensorTag.enableLuxometer();
          console.log('Enabled enableLuxometer');
        }

        // device.enableBatterLevel();

        payload = resetSensorsData(payload);
        payload = readBasicDetails(payload);

        // then turn on notifications:
        sensorTag.notifySimpleKey();
        // set a 5-second read sensors interval:
        setInterval(readSensors, 5000);
      }

      // read all the sensors except the keys:
      function readSensors() {
        // device.readGyroscope(reportGyroscope);
        // resetSensorsData(payload);
        // readBasicDetails(payload);    

        if (attributesMap.get('accel_x')?.requiredAttribute) {
          sensorTag.readAccelerometer(function reportAccelerometer(error: any, x: number, y: number, z: number) {
            if (error) {
              payload.d.accel_x = 0;
              payload.d.accel_y = 0;
              payload.d.accel_z = 0;
            } else {
              payload.d.accel_x = +x.toFixed(1);
              payload.d.accel_y = +y.toFixed(1);
              payload.d.accel_z = +z.toFixed(1);
            }
          });
        }

        if (attributesMap.get('press')?.requiredAttribute) {
          sensorTag.readBarometricPressure(function reportBarometricPressure(error: any, pressure: number) {
            payload.d.pressure = +pressure.toFixed(1);
          });
        }

        if (attributesMap.get('magneto_x')?.requiredAttribute) {
          sensorTag.readMagnetometer(function reportMagnetometer(error: any, x: number, y: number, z: number) {
            if (error) {
              payload.d.magnet_x = 0;
              payload.d.magneto_y = 0;
              payload.d.magneto_z = 0;
            } else {
              payload.d.magneto_x = +x.toFixed(1);
              payload.d.magneto_y = +y.toFixed(1);
              payload.d.magneto_z = +z.toFixed(1);
            }
          });
        }

        if (attributesMap.get('hum')?.requiredAttribute) {
          sensorTag.readHumidity(function reportHumidity(error: any, temperature: number, humidity: number) {
            if (error) {
              payload.d.temperature = 0;
              payload.d.humidity = 0;
            } else {
              payload.d.temperature = +temperature.toFixed(1);;
              payload.d.humidity = +humidity.toFixed(1);;
            }
          });
        }

        if (attributesMap.get('temperature')?.requiredAttribute) {
          sensorTag.readIrTemperature(function reportIrTemp(error: any, objectTemperature: number, ambientTemperature: number) {
            if (error) {
              payload.d.objectTemperature = 0;
              payload.d.ambientTemperature = 0;
            } else {
              payload.d.objectTemperature = +objectTemperature.toFixed(1);
              payload.d.ambientTemperature = +ambientTemperature.toFixed(1);
            }
          });
        }

        if (attributesMap.get('lux')?.requiredAttribute) {
          sensorTag.readLuxometer(function reportLuxometer(error: any, lux: number) {
            if (error) {
              payload.d.lux = 0;
            } else {
              payload.d.lux = +lux.toFixed(1);
            }
          });
        }

        // sensorTag.readBatteryLevel(reportBatteryLevel);

        console.log('\n\n --------------------------------------');
        // console.log(payload);
        if (flowService) {
          flowService.execute(payload).catch((error: any) => {
            console.log('ERROR in DataFlowService.execute: >> ');
            console.error(error);
          });
        } else {
          console.log(payload);
        }

      }

      sensorTag.connectAndSetUp(enableSensors);
      console.log('CALLED connectAndSetUp >>>> ');
      // set a listener for when the keys change:
      // sensorTag.on('simpleKeyChange', reportSimpleKey);
      // set a listener for the tag disconnects:
      sensorTag.on('disconnect', disconnect);

    } catch (err) {
      console.log("Error in connectAndSetUp: >>>>>>> ");
      console.log(err);
    }
  }

  private async fetchAttributes() {
    const thisDevice: Device = await this.commonService.getItemFromCache('thisDevice');

    const filter: any = {
      "where": {
        "metadata.tenantId": process.env.TENANT_ID,
        "metadata.entityType": "DEVICE",
        "type": AttributeType.TELEMETRY
      },
      "offset": 0,
      "limit": 500,
      "skip": 0
    };
    if (thisDevice && thisDevice.metadata && thisDevice.metadata.manufacturerId) {
      filter['where']['metadata.manufacturerId'] = thisDevice.metadata.manufacturerId;
    }
    // console.log('syncAttributes, filter: >> ', filter);
    return this.iotService.fetchAttributes(EntityType.DEVICE, filter, false);
  }

  async clean() {
    SensorTag.stopDiscoverAll(await this.onDiscover);
    this.tags.forEach((tag: any) => {
      tag.disconnect();
    });
  }

}
