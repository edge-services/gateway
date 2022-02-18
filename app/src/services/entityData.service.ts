import { ServiceBindings } from '../keys';
import { CommonServiceI, ETLFunctionServiceI, IoTServiceI, RuleServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { EntityDataServiceI } from '.';
import { Attribute, AttributeType, DataType, EntityData } from '../models';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { EntityDataRepository } from '../repositories';
import { repository } from '@loopback/repository';

@bind({scope: BindingScope.SINGLETON})
export class EntityDataService implements EntityDataServiceI {

    influx: InfluxDB;


    constructor(
        @repository(EntityDataRepository) public entityDataRepository : EntityDataRepository, 
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.IOT_SERVICE) private iotService: IoTServiceI
    ) {
        
    }

    async insert(payload: any): Promise<any>{
        // console.log('In EntityDataService.insert, payload: >> ', payload); 
        if(!payload){
            return Promise.reject("No Payload to save in DB ");
        }
        const cacheKey = `${payload.entityCategoryId}_Attributes`;
        let attributes: Attribute[] = await this.commonService.getItemFromCache(cacheKey);
        if(!attributes){
            const filter = {
                "where": {
                    "metadata.entityType": payload.entityType,
                    "metadata.entityCategoryId": payload.entityCategoryId,
                    "type" : AttributeType.TELEMETRY
                },
                "offset": 0,
                "limit": 500,
                "skip": 0
                };   
            attributes = await this.iotService.fetchAttributes(payload.entityType, filter, false);
            await this.commonService.setItemInCache(cacheKey, attributes);
        }
        
        let entityDataList: EntityData[] = [];
        if(attributes && attributes.length > 0){
            attributes.forEach(attribute => {
                let attributeValue = undefined;
                if(payload[attribute.key]){
                    attributeValue = payload[attribute.key];
                }
                if(payload.d && payload.d[attribute.key]){
                    attributeValue = payload.d[attribute.key];
                }

                if(attributeValue && attributeValue != undefined){
                    let entityData: EntityData = new EntityData();
                    entityData.entityId = payload.entityId || payload.uniqueId;
                    entityData.entityCategoryId = payload.entityCategoryId;
                    entityData.entityType = payload.entityType;
                    entityData.attributeKey = attribute.key;
                    entityData.attributeType = attribute.type;
                    entityData.unit = payload.unit || attribute.dataUnit;
                    entityData.attributeValue = attributeValue;
                    entityData.dataType = attribute.dataType;
                    entityData.ts = new Date();
                    entityDataList.push(entityData);
                }
            });

            return this.entityDataRepository.insert(entityDataList);

        }else{
           return Promise.resolve("No Attributes for the EntityCategoryId: " +payload.entityCategoryId);
        }
    
    }


}
