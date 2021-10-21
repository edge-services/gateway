import { UserModifiableEntity } from './user-modifiable-entity.model';
import {model, property} from '@loopback/repository';
// import { Attribute } from './attribute.model';
import { EnvType } from '.';
// import {v4 as uuid} from 'uuid';

@model({
  name: 'edges',
  settings: {strict: false}
})
export class Edge extends UserModifiableEntity {
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
    required: true
  })
  flowId?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(EnvType),
    },
  })
  envType: EnvType;

  @property({
    type: 'object',
    required: true    
  })
  fromNode?: object;

  @property({
    type: 'object',
    required: true    
  })
  toNode?: object;

  @property({
    type: 'boolean',
    required: false,
    default: false
  })
  bidirectional: boolean;

  @property({
    type: 'object',
    required: false,
  })
  edgeConfig: object;

  // Define well-known properties here

  constructor(data?: Partial<Edge>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface EdgeRelations {
  // describe navigational properties here
}

export type EdgeWithRelations = Edge & EdgeRelations;


