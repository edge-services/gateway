import { ServiceBindings } from '../keys';
import {bind, inject, BindingScope} from '@loopback/core';
import { SimulatorUtilityI } from '.';
import { CommonServiceI, RuleServiceI } from '../services';
import * as SCHEDULE from 'node-schedule';
import * as simulateJson from '../config/simulate.json';

@bind({scope: BindingScope.TRANSIENT})
export class SimulatorUtility implements SimulatorUtilityI {

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI        
    ) { }

    async simulate(config: any): Promise<void> {    
        try{
                console.log('Starting SIMULATOR....');
                await this.createScheduler(simulateJson);
                let rules: Array<any> = simulateJson.rules;
                this.ruleService.addRules(rules);
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
                    this.ruleService.processRules(sensorData);                         
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
