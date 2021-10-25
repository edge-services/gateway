import { ServiceBindings } from '../keys';
import {bind, inject, BindingScope} from '@loopback/core';
import { SimulatorUtilityI } from '.';
import { CommonServiceI, DataFlowServiceI } from '../services';
import * as SCHEDULE from 'node-schedule';
import * as simulateJson from '../config/simulate.json';

@bind({scope: BindingScope.TRANSIENT})
export class SimulatorUtility implements SimulatorUtilityI {

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.DATA_FLOW_SERVICE) private dataflowService: DataFlowServiceI        
    ) { }

    async simulate(config: any): Promise<void> {    
        try{
                console.log('Starting SIMULATOR....');
                await this.createScheduler(simulateJson);                
            } catch(err){
                console.log("Error in simulate: >>>>>>> ");
                console.log(err);
            }
    }

    async createScheduler(simulateJson: any): Promise<any> {
        for(let device of simulateJson.devices){
            for(const p of device.publish){
                let s = SCHEDULE.scheduleJob(p.frequency, () => {
                    let sensorData: any = {
                        type: device.type,
                        uniqueId: device.uniqueId                        
                    };
                    for(const sensor of p.sensors){
                        sensorData[sensor.name] = this.getRandomInclusive(sensor.config);                             
                    }; 
                    // console.log(sensorData);
                    // sensorData = '{"type":"HB_SENSOR","uniqueId":"SB_MICRO-3C71BF4340FC","temp":26.69,"hum":55.14746,"press":988.9286,"alt":204.4888}';
                    try{
                        const payload = JSON.parse(sensorData);
                        this.dataflowService.execute(payload).catch(error => {
                            console.log('ERROR in Simulator: >> ');
                            console.error(error);
                        }) 
                    }catch(error){
                        console.error(error);
                    }                                          
                });                              
            }            
        }        
    }

    getRandomInclusive(config: any) {
        config.min = Math.ceil(config.min);
        config.max = Math.floor(config.max);
        return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min; //The maximum is inclusive and the minimum is inclusive 
    }

}
