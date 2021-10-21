import { Model, model, property } from '@loopback/repository';
import { EntityType } from '.';

@model()
export class EntityInfo extends Model {

    @property({
        type: 'string',
        required: true,
        index: true,
        jsonSchema: {
            enum: Object.values(EntityType),
        }
    })
    entityType?: EntityType;
    
    @property({
        type: 'string',
        required: false,
    })
    entityId: string;
    
    @property({
        type: 'string',
        required: true,
        index: true,
    })
    entityCategoryId: string;

    constructor(data?: Partial<EntityInfo>) {
        super(data);
    }
}