import { ServiceBindings } from '../keys';
import { CommonServiceI, ETLFunctionServiceI, IoTServiceI, RuleServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';
// const moment = require('moment');
import fetch from 'cross-fetch';
import { DataFlowServiceI } from '.';

@bind({scope: BindingScope.SINGLETON})
export class DataFlowService implements DataFlowServiceI {

    engine: Engine;
    moment = moment;

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI,
        @inject(ServiceBindings.ETLFUNCTION_SERVICE) private etlFunctionService: ETLFunctionServiceI,
        @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI,
    ) {
        this.moment = moment;
    }


    async execute(payload: any): Promise<any>{
        console.log('In DataFlowService.execute, payload: >> ', payload);        
        if(payload['type'] && payload['uniqueId']){
           payload = await this.etlFunctionService.execute(payload);
           await this.ruleService.execute(payload);
        }

        return payload;
    }


}
