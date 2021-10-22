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

    private async addRules(rules: Array<Rule>) {
        if(rules){
            for(let rule of rules){
                this.engine.addRule(rule);
                console.log('Rule Added: >> ', JSON.stringify(rule));
            } 
        }               
    }

    async execute(payload: any): Promise<void> {    
        try{
            console.log('IN RuleService.execute, payload: >> ', payload);
                if(payload) {
                    if(payload && payload.d){
                        this.engine
                        .run(payload)
                        .then(results => {
                            results.events.map(event => {
                                if(event && event.params){
                                    delete payload['success-events'];  
                                    console.log('EVENT: >> ', event);                                  
                                    if(event.params && event.params.action && event.params.action == 'publish'){
                                        console.log("Rule Triggered for data: ", payload, ", Event: ", event, "\n\n"); 
                                        // this.publishIFTTTWebhook(event.type, {'value1': transformedData.d.temp, 'value2': transformedData.d.hum});
                                        this.publishToFlow(event, payload);                                                                 
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

    private async publishToFlow(event: any, data: any){
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
