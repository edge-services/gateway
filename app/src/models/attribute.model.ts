import {model, property} from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import { EntityType, AttributeType } from './types';

@model({
  name: 'attributes',
  settings: {strict: false}
})
export class Attribute extends UserModifiableEntity {

    @property({
      type: 'string',
      id: true,
      defaultFn: "uuidv4"
    })
    id?: string;

    @property({
      type: 'string',
      required: true
    })
    tenantId?: string;
  
    @property({
      type: 'string',
      required: true
    })
    accountId?: string;
    
    @property({
      type: 'string',
      required: true,
      jsonSchema: {
        enum: Object.values(EntityType),
      },
    })
    entityType: EntityType;

    @property({
      type: 'string',
      required: false,
    })
    entityId: string;

    @property({
      type: 'string',
      required: true,
    })
    entityCategoryId: string;

    @property({
      type: 'string',
      required: true,
      jsonSchema: {
        enum: Object.values(AttributeType),
      },
    })
    type: AttributeType; // This can be Client Side (CS) | Server Side (SS) | Shared (SH) | Telemetry

    @property({
      type: 'string',
      required: true
    }) 
    key: string; // temp, humidity, switch1, switch2
    
    @property() label: string; // Fan Switch, Kitchen Light 

    @property() dataType: string; // number, float, string, boolean, object

    @property() dataUnit: string; // unit of data value, for eg. grams, kg, meters, degree celcius or fahrenheit etc

    @property() defaultValue: string;

    @property({
      type: 'Boolean',
      required: false,
      default: false
    }) 
    requiredAttribute: Boolean; // Is this a required attribute for an Entity

    @property() description: string;

    @property({
      type: 'object',
      required: false,
    })
    attributeConfig: object;

    constructor(data?: Partial<Attribute>) {
        super(data);
    }

}

export interface AttributeRelations {
  // describe navigational properties here
}

export type AttributeWithRelations = Attribute & AttributeRelations;