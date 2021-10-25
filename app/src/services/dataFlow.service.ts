import { ServiceBindings } from '../keys';
import { ETLFunctionServiceI, RuleServiceI } from './types';
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
    ) {
        this.moment = moment;
    }


    async execute(payload: any): Promise<any>{
        try{
            payload = JSON.parse(payload);
        }catch(error){
            // console.log('INVLAID JSON DATA: >> ', payload);
        }
        // console.log('In DataFlowService.execute, payload: >> ', payload); 
        try{
            if(payload['type'] && payload['uniqueId']){
                payload = await this.etlFunctionService.execute(payload);
                payload = await this.ruleService.execute(payload).catch(error => {
                    console.error(error);
                });
                return await this.entityDataService.insert(payload);
             }
            //  return Promise.resolve(payload);
        }catch(error){
            console.error(error);
            return Promise.reject(error);
        } 
        
    }


}
