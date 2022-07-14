import {bind, inject, BindingScope} from '@loopback/core';
import { DataFlowServiceI } from '.';
import { ServiceBindings } from '../keys';
import { SensorTagServiceI } from './types';

let SensorTag = require('@sinny777/ti-sensortag');

@bind({scope: BindingScope.SINGLETON})
export class SensorTagService implements SensorTagServiceI {

    constructor(
      @inject(ServiceBindings.DATA_FLOW_SERVICE) private  dataFlowService: DataFlowServiceI
    ) {
     
    }

  async initSensorTag(): Promise<void>{    
    try{       
        let that = this;
        SensorTag.discoverAll(function(device: any){
          that.onDiscover(device);
        });        
      }catch(err){
          console.log("Error in initSensortag: >>>>>>> ");
          console.log(err);
      }
  }

  onDiscover(sensorTag: any){
    let flowService = this.dataFlowService;
    let payload: any = {type: 'TI_SensorTag', d: {}};
    console.log('IN OnDiscover, sensorTag: >> ', sensorTag.id);
    try{
      // let that = this;
      function disconnect() {
        console.log('Sensortag disconnected!');
      }
    
      function readBasicDetails(payload: any){
          payload['uniqueId'] = sensorTag.id;
          payload['model'] = sensorTag.type;
          sensorTag.readSystemId(function(error: any, systemId: string){
              console.log('systemId: >> ', systemId);
              payload['systemId'] = systemId;
          });
          sensorTag.readSerialNumber(function(error: any, serialNumber: string){
              console.log('serialNumber: >> ', serialNumber);
              payload['serialNumber'] = serialNumber;
          });
      }

      function enableSensors() {		// attempt to enable the sensors
        console.log('Enabling sensors');
        // // enable sensor:
        sensorTag.enableAccelerometer();
        sensorTag.enableBarometricPressure();
        // device.enableGyroscope();
        sensorTag.enableMagnetometer();
        sensorTag.enableHumidity();
        sensorTag.enableIrTemperature();		
        sensorTag.enableLuxometer();
        // device.enableBatterLevel();

        readBasicDetails(payload);
    
        payload.d.accel_x = 0.0;
        payload.d.accel_y = 0.0;
        payload.d.accel_z = 0.0;
        payload.d.pressure = 0.0;
        payload.d.magneto_x = 0.0;
        payload.d.magneto_y = 0.0;
        payload.d.magneto_z = 0.0;
        // payload.gyro = {sensor: 'gyroscope'};
        payload.d.temperature = 0.0;
        payload.d.humidity = 0.0
        payload.d.objectTemperature = 0.0;
        payload.d.ambientTemperature = 0.0;
        payload.d.lux = 0.0;
        payload.d.keys = {};

        // then turn on notifications:
        sensorTag.notifySimpleKey();    
        // set a 5-second read sensors interval:
        setInterval(readSensors, 5000);
      }

      // read all the sensors except the keys:
      function readSensors() {
        // device.readGyroscope(reportGyroscope);
        sensorTag.readAccelerometer(function reportAccelerometer (error: any, x: number, y: number, z: number) {
          if(error){
            payload.d.accel_x = 0;
            payload.d.accel_y = 0;
            payload.d.accel_z = 0;
          }else{
            payload.d.accel_x = +x.toFixed(1);
            payload.d.accel_y = +y.toFixed(1);
            payload.d.accel_z = +z.toFixed(1);
          }          
        });

        sensorTag.readBarometricPressure(function reportBarometricPressure(error: any, pressure: number) {
          payload.d.pressure = +pressure.toFixed(1);
        });
        sensorTag.readMagnetometer(function reportMagnetometer(error: any, x: number, y: number, z: number) {
          if(error){
            payload.d.magnet_x = 0;
            payload.d.magneto_y = 0;
            payload.d.magneto_z = 0;
          }else{
            payload.d.magneto_x = +x.toFixed(1);
            payload.d.magneto_y = +y.toFixed(1);
            payload.d.magneto_z = +z.toFixed(1);
          }
        });
        sensorTag.readHumidity(function reportHumidity(error: any, temperature: number, humidity: number) {
          if(error){
            payload.d.temperature = 0;
            payload.d.humidity = 0;
          }else{
            payload.d.temperature = +temperature.toFixed(1);;
            payload.d.humidity = +humidity.toFixed(1);;
          }
        });
        sensorTag.readIrTemperature(function reportIrTemp(error: any, objectTemperature: number, ambientTemperature: number) {
          if(error){
            payload.d.objectTemperature = 0;
            payload.d.ambientTemperature = 0;
          }else{
            payload.d.objectTemperature = +objectTemperature.toFixed(1);
            payload.d.ambientTemperature = +ambientTemperature.toFixed(1);
          }
        });		
        sensorTag.readLuxometer(function reportLuxometer(error: any, lux: number){
          if(error){
            payload.d.lux = 0;
          }else{
            payload.d.lux = +lux.toFixed(1);
          }

        // sensorTag.readBatteryLevel(reportBatteryLevel);
      });
       
        console.log('\n\n --------------------------------------');
        // console.log(payload);
        if(flowService){
          flowService.execute(payload).catch((error: any) => {
            console.log('ERROR in DataFlowService.execute: >> ');
            console.error(error);
          });           
        }else{
          console.log(payload);
        }
        
      }

      sensorTag.connectAndSetUp(enableSensors);
      // set a listener for when the keys change:
      // sensorTag.on('simpleKeyChange', reportSimpleKey);
      // set a listener for the tag disconnects:
      sensorTag.on('disconnect', disconnect);

    }catch(err){
        console.log("Error in connectAndSetUp: >>>>>>> ");
        console.log(err);
    }   
  }

}
