import { ServiceBindings } from '../keys';
import { RuleServiceI, CommonServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';
// const moment = require('moment');
import fetch from 'cross-fetch';
import { NotificationStrategy, NotificationStrategyWhen } from '../models';

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
                if(payload){
                    this.engine
                    .run(payload)
                    .then(results => {
                        results.events.map(async event => {
                            if(event && event.params){
                                delete payload['success-events'];  
                                payload.event = event;                                 
                                await this.processActions(payload);                                   
                            }                            
                        });
                    }).catch(err => {
                        // console.log(err.stack);
                        return Promise.reject(err);
                    });
                }
                delete payload['success-events']; 
                return Promise.resolve(payload); 
            } catch(err){
                return Promise.reject(err);
            }
    }

    private processActions(payload: any): Promise<any>{
        // console.log("Event Triggered for payload: ", payload); 
        if(payload && payload.event){
            if(payload.event.params && payload.event.params.publish){
                if(payload.event.params.publish.when == NotificationStrategyWhen.EVERY_TIME){
                    this.publishToFlow(payload);                                                                
                }
                if(payload.event.params.publish.when == NotificationStrategyWhen.X_IN_Y){
                    this.handleXInY(payload, payload.event.params.publish);                                                                
                }              
            }
        }
        
        return Promise.resolve(payload);
    }

    private async handleXInY(payload: any, publishConfig: NotificationStrategy){
        const timeNow = new Date();        
        const key = 'ALERT_'+payload.entityId;
        let alert = await this.commonService.getItemFromCache(key);
        let count = 1;
        let seconds: number;
        if(alert && alert != undefined){
            count = alert.count + 1;
            seconds = (timeNow.getTime() - alert.time.getTime()) / 1000;
        }else{
            seconds = (timeNow.getTime() - timeNow.getTime()) / 1000; 
        }
        
        if(publishConfig.timePeriod && seconds < publishConfig.timePeriod && count == publishConfig.count){
            await this.publishToFlow(payload);
            // await this.commonService.setItemInCache(key, {time: timeNow, count: 0});
            await this.commonService.setItemInCache(key, undefined);
        }else{
            await this.commonService.setItemInCache(key, {time: timeNow, count: count});
        }
        
    }

    private async publishToFlow(payload: any){
        // console.log("IN publishToFlow payload: ", payload); 
        if(process.env.FLOW_URL){
            console.log('IN publishToFlow: >> Event: ', payload.event);
            try{
                payload.topic = 'detection';
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
            }catch(error){
                console.error(error);
            }            
        }               
    }

    // private async publishIFTTTWebhook(event: string, payload: any){
    //     console.log('IN publishIFTTTWebhook: >> Event: ', event, ', Payload: ', payload);
    //     const iftt_URL = `https://maker.ifttt.com/trigger/${event}/with/key/btF72fQ8puB6rda4-ANVvn`;
    //     const response = await fetch(iftt_URL, {
    //         method: 'POST',
    //         body: JSON.stringify(payload),
    //         headers: {'Content-Type': 'application/json'} });
          
    //       if (!response.ok) { 
    //           console.log('NO RESPONSE FROM IFTTT WebHook POST');
    //       }
        
    //       if (response.body !== null) {
    //         // console.log(response.body);
    //       }
    // }

}
