import { ServiceBindings } from '../keys';
import { CommonServiceI, ETLFunctionServiceI, IoTServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';
// const moment = require('moment');
import fetch from 'cross-fetch';
import { ETLFunction } from '../models';

@bind({scope: BindingScope.SINGLETON})
export class ETLFunctionService implements ETLFunctionServiceI {

    engine: Engine;
    moment = moment;

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI,
    ) {
        this.moment = moment;
    }


    async execute(payload: any): Promise<any>{
        console.log('In ETLFunctionService.execute, payload: >> ', payload);
        try{
            payload = JSON.parse(payload);
        }catch(error){
            // console.log('INVLAID JSON DATA: >> ', payload);
        }

        try{
            if(payload['type'] && payload['uniqueId']){
                const cacheKey = `${payload['uniqueId']}_ETLFunction`;
               const etlFunctions: any[] = await this.commonService.getItemFromCache(cacheKey);
               if(!etlFunctions || etlFunctions.length == 0){
                    const filter = {
                            "where": {
                                "deviceSerialNo": payload['uniqueId']
                            }
                        };
                      
                    const devices: any[] = await this.iotService.fetchDevices(filter, true);
                    console.log('ETLFunctionService.execute, devices: >> ', devices);
                    if(devices && devices[0]){
                        const filter = {
                            "where": {
                                "tenantId": process.env.TENANT_ID,
                                "accountId": devices[0].accountId,
                                "metadata.entityType": "DEVICE",
                                "metadata.entityCategoryId": {"inq": devices[0].deviceCategoryId}
                            },
                            "offset": 0,
                            "limit": 100,
                            "skip": 0
                            };
                          
                            const etlFunctions: ETLFunction[] = await this.iotService.fetchETLFunctions(filter, true);
                            // console.log('etlFunctions: >> ', etlFunctions);
                            if(etlFunctions && etlFunctions.length > 0 ){
                                etlFunctions.forEach(etlFunction => {
                                    if(etlFunction && etlFunction.content && etlFunction.content.payload){
                                        const functStr: string = etlFunction.content.payload;                                        
                                        let transFunc: Function = new Function('return ' +functStr)();
                                        console.log('transFunc: >> ', transFunc);
                                        payload = transFunc(this, payload);
                                    }                                
                                });
                                this.commonService.setItemInCache(cacheKey, etlFunctions);
                            }else{
                                this.commonService.setItemInCache(cacheKey, undefined);
                            }                        
                    }                
               }
            }
        }catch(error){
            console.error(error);
        }
        
        // let func = function transform(self: any, payload: any){
        //     try{
        //         payload = JSON.parse(payload);
        //     }catch(error){
        //         // console.log('INVLAID JSON DATA: >> ', payload);
        //     }
        //     let transformedPayload: any;
        //     if(payload['type'] && payload['uniqueId'] && !payload['d']){
        //         transformedPayload = {
        //             type: payload['type'],
        //             uniqueId: payload['uniqueId'],
        //             d: {
        //                 temp: payload['temp'],
        //                 hum: payload['hum'],
        //                 press: payload['press'],
        //                 alt: payload['alt']
        //             }
        //         };
        //         transformedPayload['d']['ts'] = self.moment().format('YYYY-MM-DD HH:mm:ss Z');
        //     }else{
        //         transformedPayload = payload;
        //         transformedPayload['ts'] = self.moment().format('YYYY-MM-DD HH:mm:ss Z');                
        //     }
            
        //     // console.log('In transformNvalidate, Transformed data: >> ', transformedPayload);
        //     return transformedPayload;
        // };
        
        // var transformFuncStr = String(func);
        // let transFunc: Function = new Function ('return ' +transformFuncStr)();

        return payload;
    }


}
