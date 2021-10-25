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
            if(payload['type'] && payload['uniqueId']){
               const cacheKey = `${payload['uniqueId']}_ETLFunction`;
               let etlFunctions: ETLFunction[] = await this.commonService.getItemFromCache(cacheKey);
            //    console.log('etlFunctions from Cache: >> ', etlFunctions);
               if(!etlFunctions){
                    let entityCategoryId = undefined;
                    if(payload.entityCategoryId && (payload.entityCategoryId != undefined || payload.entityCategoryId.length > 0)){
                        entityCategoryId = payload.entityCategoryId;
                    }else{
                        const filter = {
                            "where": {
                                "deviceSerialNo": payload['uniqueId']
                            }
                        };
                      
                        const devices: any[] = await this.iotService.fetchDevices(filter, false);
                        // console.log('ETLFunctionService.execute, devices: >> ', devices);
                        if(devices && devices[0]){
                            entityCategoryId = devices[0].deviceCategoryId;
                        }
                    }
                    
                    if(entityCategoryId){
                        const filter = {
                            "where": {
                                "metadata.entityType": "DEVICE",
                                "metadata.entityCategoryId": entityCategoryId
                            },
                            "offset": 0,
                            "limit": 100,
                            "skip": 0
                            };
                          
                            etlFunctions = await this.iotService.fetchETLFunctions(filter, false);
                            await this.commonService.setItemInCache(cacheKey, etlFunctions);
                    }                
               }
               
               if(etlFunctions && etlFunctions.length > 0 ){
                    etlFunctions.forEach(etlFunction => {
                        if(etlFunction && etlFunction.content && etlFunction.content.payload){
                            const functStr: string = etlFunction.content.payload;                                        
                            let transFunc: Function = new Function('return ' +functStr)();
                            // console.log('transFunc: >> ', transFunc);
                            payload = transFunc(this, payload);
                            if(payload && !payload.entityCategoryId){
                                payload.entityCategoryId = etlFunction.metadata.entityCategoryId;
                                payload.entityType = etlFunction.metadata.entityType;
                            }
                        }                                
                    });                    
                }
            }
        }catch(error){
            console.error(error);
        }
        // console.log('payload: >> ', payload);
        return payload;
    }


}
