import { ServiceBindings } from '../keys';
import { RuleServiceI, CommonServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';
// const moment = require('moment');
import fetch from 'cross-fetch';

@bind({scope: BindingScope.SINGLETON})
export class RuleService implements RuleServiceI {

    engine: Engine;
    moment = moment;

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
    ) {
        this.engine = new Engine();
        this.moment = moment;
    }

    async formatNAddRules(rules: Array<any>): Promise<void>{
        let formatedRules: Array<Rule> = [];
        for(let rule of rules){
            if(rule.condition.type == 'all' || rule.condition.type == 'any'){
                let formatedRule: any = {name: rule.name ,'conditions': {}, 'event': rule.event};
                formatedRule['conditions'][rule.condition.type] = [];
                for(let child of rule.condition.children){
                    if(child.type == 'fact'){
                        formatedRule['conditions'][rule.condition.type].push({
                            "fact": child.fact.key,
                            "operator": child.fact.operator,
                            "value": child.fact.value,
                            "path": child.fact.path
                        })                       
                    }
                }
                formatedRules.push(new Rule(formatedRule));
            }
        }
        
        await this.addRules(formatedRules);

    }

    async addRules(rules: Array<Rule>) {
        if(rules){
            for(let rule of rules){
                this.engine.addRule(rule);
                // console.log('Rule Added: >> ', JSON.stringify(rule));
            } 
        }               
    }

    async processRules(payload: any): Promise<void> {    
        try{
            // console.log('IN RuleService.processRules, payload: >> ', payload);
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
                                    console.log('EVENT: >> ', event);                                  
                                    if(event.type == 'HotNHumid'){
                                        console.log("Rule Triggered for data: ", transformedData, ", Event: ", event, "\n\n"); 
                                        // this.publishIFTTTWebhook(event.type, {'value1': transformedData.d.temp, 'value2': transformedData.d.hum});
                                        this.publishToFlow(event.type, transformedData);                                                                 
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
        // console.log('In transformNvalidate, payload: >> ', payload);
        let func = function transform(self: any, payload: any){
            try{
                payload = JSON.parse(payload);
            }catch(error){
                console.log('INVLAID JSON DATA: >> ', payload);
            }
            let transformedPayload: any;
            if(payload['type'] && payload['uniqueId'] && !payload['d']){
                transformedPayload = {
                    type: payload['type'],
                    uniqueId: payload['uniqueId'],
                    d: {
                        temp: payload['temp'],
                        hum: payload['hum'],
                        press: payload['press'],
                        alt: payload['alt']
                    }
                };
                transformedPayload['d']['ts'] = self.moment().format('YYYY-MM-DD HH:mm:ss Z');
            }else{
                transformedPayload = payload;
                transformedPayload['ts'] = self.moment().format('YYYY-MM-DD HH:mm:ss Z');                
            }
            
            console.log('In transformNvalidate, Transformed data: >> ', transformedPayload);
            return transformedPayload;
        };
      
        var transformFuncStr = String(func);
        let transFunc: Function = new Function ('return ' +transformFuncStr)();

        return transFunc(this, payload);
    }

    private async publishToFlow(event: Event, data: any){
        console.log('IN publishToFlow: >> Event: ', event, ', Data: ', data);
        if(process.env.FLOW_URL){

            let payload = {
                "topic": "detection",
                "event": event.type,
                "data": data,
                "metadata": {
                    "deviceId": await this.commonService.getSerialNumber(),
                    "deviceCategory":"EdgeGateway",
                    "tenantId": "ibm",
                    "accountId": "3beGT2qPs8SzMNWTaeMN61"
                }
            }

            const response = await fetch(process.env.FLOW_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'} });
              
              if (!response.ok) { 
                  console.log('NO RESPONSE FROM FLOW SERVICE POST');
              }
            
              if (response.body !== null) {
                // console.log(response.body);
              }
        }       
        
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
