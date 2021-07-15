import { ServiceBindings } from '../keys';
import { RuleServiceI, CommonServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
// import moment from 'moment';
const moment = require('moment');
import fetch from 'cross-fetch';

@bind({scope: BindingScope.TRANSIENT})
export class RuleService implements RuleServiceI {

    engine: Engine;
    moment = moment();

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
    ) {
        this.engine = new Engine();
        this.moment = moment();
     }

    async addRules(rules: Array<Rule>) {
        if(rules){
            for(let rule of rules){
                this.engine.addRule(rule);
            } 
        }               
    }

    async processRules(payload: any): Promise<void> {    
        try{
                const transformedData: any = await this.transformNvalidate(payload);
                // console.log('transformedData: >> ', transformedData);
                if(transformedData) {
                    if(transformedData && transformedData.d){
                        this.engine
                        .run(transformedData)
                        .then(results => {
                            results.events.map(event => {
                                if(event && event.params){
                                    delete transformedData['success-events'];                                    
                                    if(event.type == 'HotNHumid'){
                                        console.log("Rule Triggered for data: ", transformedData, ", Event: ", event, "\n\n"); 
                                        this.publishIFTTTWebhook(event.type, {'value1': payload.d.temp, 'value2': payload.d.hum});                                                                 
                                    }                                    
                                }                            
                            });
                        }).catch(err => console.log(err.stack));
                    }                    
                }
            } catch(err){
                console.log("Error in processRules: >>>>>>> ");
                console.error(err);
            }
    }

    private async transformNvalidate(payload: any): Promise<any>{

        let func = function transform(self: any, payload: any){
            payload['d']['ts'] = self.moment.format('YYYY-MM-DD HH:mm:ss Z')
            console.log('In Transform function: >> ', payload);
            return payload;
        };
      
        var transformFuncStr = String(func);
        let transFunc: Function = new Function ('return ' +transformFuncStr)();

        return transFunc(this, payload);
    }

    private async publishIFTTTWebhook(event: string, payload: any){
        console.log('IN publishIFTTTWebhook: >> Event: ', event, ', Payload: ', payload);
        const iftt_URL = `https://maker.ifttt.com/trigger/${event}/with/key/btF72fQ8puB6rda4-ANVvn`;
        const response = await fetch(iftt_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'} });
          
          if (!response.ok) { 
              console.log('NO RESPONSE FROM IFTTT WebHook POST');
          }
        
          if (response.body !== null) {
            // console.log(response.body);
          }
    }

}
