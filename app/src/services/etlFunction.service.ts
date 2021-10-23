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
        // console.log('In ETLFunctionService.execute, payload: >> ', payload);
        try{
            payload = JSON.parse(payload);
        }catch(error){
            // console.log('INVLAID JSON DATA: >> ', payload);
        }

        try{
            if(payload['type'] && payload['uniqueId']){
               const cacheKey = `${payload['uniqueId']}_ETLFunction`;
               let etlFunctions: any[] = await this.commonService.getItemFromCache(cacheKey);
            //    console.log('etlFunctions from Cache: >> ', etlFunctions);
               if(!etlFunctions || etlFunctions.length == 0){
                    const filter = {
                            "where": {
                                "deviceSerialNo": payload['uniqueId']
                            }
                        };
                      
                    const devices: any[] = await this.iotService.fetchDevices(filter, true);
                    // console.log('ETLFunctionService.execute, devices: >> ', devices);
                    if(devices && devices[0]){
                        const filter = {
                            "where": {
                                "tenantId": process.env.TENANT_ID,
                                "accountId": devices[0].accountId,
                                "metadata.entityType": "DEVICE",
                                "metadata.entityCategoryId": {"inq": [devices[0].deviceCategoryId]}
                            },
                            "offset": 0,
                            "limit": 100,
                            "skip": 0
                            };
                          
                            etlFunctions = await this.iotService.fetchETLFunctions(filter, true);
                    }                
               }

               if(etlFunctions && etlFunctions.length > 0 ){
                    etlFunctions.forEach(etlFunction => {
                        if(etlFunction && etlFunction.content && etlFunction.content.payload){
                            const functStr: string = etlFunction.content.payload;                                        
                            let transFunc: Function = new Function('return ' +functStr)();
                            // console.log('transFunc: >> ', transFunc);
                            payload = transFunc(this, payload);
                        }                                
                    });
                    await this.commonService.setItemInCache(cacheKey, etlFunctions);
                }else{
                    await this.commonService.setItemInCache(cacheKey, undefined);
                } 
            }
        }catch(error){
            console.error(error);
        }
        // console.log('payload: >> ', payload);
        return payload;
    }


}
