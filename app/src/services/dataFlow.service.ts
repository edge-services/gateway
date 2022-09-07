import { ServiceBindings } from '../keys';
import { CommonServiceI, ETLFunctionServiceI, RuleServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';
// const moment = require('moment');
import fetch from 'cross-fetch';
import { DataFlowServiceI, EntityDataServiceI } from '.';

@bind({scope: BindingScope.SINGLETON})
export class DataFlowService implements DataFlowServiceI {

    engine: Engine;
    moment = moment;
    
    constructor(
        @inject(ServiceBindings.ETLFUNCTION_SERVICE) private etlFunctionService: ETLFunctionServiceI,
        @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI,
        @inject(ServiceBindings.ENTITY_DATA_SERVICE) private entityDataService: EntityDataServiceI,
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    ) {
        this.moment = moment;                 
    }


    async execute(data: any): Promise<any>{
        // console.log('In DataFlowService.execute, data: >> ', data);
        let payload: any = {};
        try{
            payload = JSON.parse(data);                     
        }catch(error){
            payload = Object.assign(payload, data);            
        }
        
        const status: string = await this.commonService.getItemFromCache('status');
        if(status && status != 'COMPLETED'){
            console.log('Wait .... ', status, ' in progress....');
            return Promise.reject('Waiting for Gateway to start/update');
        }

        try{
            if(payload['type'] && payload['uniqueId']){
                payload = await this.etlFunctionService.execute(payload);
                payload = await this.ruleService.execute(payload).catch(error => {
                    console.error(error);
                });
                
                if(process.env.INFLUXDB_URL){
                    await this.entityDataService.insert(payload);
                }
                
                return Promise.resolve("SUCCESS");
             }
            //  return Promise.resolve(payload);
        }catch(error){
            console.error(error);
            console.log('In DataFlowService.execute, ERROR, payload: >> ', payload);
            return Promise.reject(error);
        } 
        
    }


}
