import { UserModifiableEntity } from './user-modifiable-entity.model';
import {model, property} from '@loopback/repository';
import { EnvType } from '.';

@model({
  name: "etlFunctions",
  settings: {strict: false}
})
export class ETLFunction extends UserModifiableEntity {
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
      enum: Object.values(EnvType),
    },
  })
  envType: EnvType;

  @property({
    type: 'string',
    required: true,
    index: true
  })
  name?: string;

  @property({
    type: 'string'    
  })
  label?: string | undefined;

  @property({
    type: 'object',
    required: true
  })
  content?: object;

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

  @property({
    type: 'string',
    required: false,
  })
  tags?: string | undefined;
 
  // Define well-known properties here

  constructor(data?: Partial<ETLFunction>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface ETLFunctionRelations {
  // describe navigational properties here
}

export type ETLFunctionWithRelations = ETLFunction & ETLFunctionRelations;


