import { UserModifiableEntity } from './user-modifiable-entity.model';
import {model, property} from '@loopback/repository';
import { EntityType, EnvType } from '.';

@model({
  name: "flows",
  settings: {strict: false}
})
export class Flow extends UserModifiableEntity {
  
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
    index: true,
  })
  entityCategoryId: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(EnvType),
    },
  })
  envType: EnvType;

  @property({
    type: 'string',
    required: false,
    default: "default"
  })
  name?: string;

  @property({
    type: 'string',
    default: "DefaultFlow"    
  })
  label?: string | undefined;
  
  @property({
    type: 'string',
    required: false,
  })
  description?: string | undefined;

  @property({
    type: 'object',
    required: false
  })
  metadata?: object;
 
  // Define well-known properties here

  constructor(data?: Partial<Flow>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface FlowRelations {
  // describe navigational properties here
}

export type FlowWithRelations = Flow & FlowRelations;


