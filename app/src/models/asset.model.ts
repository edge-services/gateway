import {model, property} from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
// import {v4 as uuid} from 'uuid';
// import { Permission } from '@loopback/security';

@model({
  name: 'assets',
  settings: {strict: false}
})
export class Asset extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    defaultFn: "uuidv4"
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
    index: true,
    default: null
  })
  parentId?: string;

  @property({
    type: 'string',
    required: true,
    index: true
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
    index: true
  })
  type?: string;

  @property({
    type: 'string'    
  })
  label?: string;

  @property({
    type: 'string',
    required: false
  })
  tenantId?: string;

  @property({
    type: 'string',
    required: false
  })
  customerId?: string;

  @property({
    type: 'string',
    required: false,
  })
  description?: string | undefined;

 
  // Define well-known properties here

  constructor(data?: Partial<Asset>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface AssetRelations {
  // describe navigational properties here
}

export type AssetWithRelations = Asset & AssetRelations;


