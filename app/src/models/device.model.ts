import {model, property} from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import { Location } from './location.model';
import { DeviceStatus } from './types';
import { Metadata } from './metadata.model';

@model({
  name: 'devices',
  settings: {
    strict: false,
    indexes: {
      name: {
        keys: {
          name: 1,
        }
      },
    },
  },
})
export class Device extends UserModifiableEntity {

  @property({
    type: 'string',
    id: true,
    defaultFn: "uuidv4"
  })
  id?: string;

  @property({
    type: 'object',
    required: true
  })
  metadata: Metadata;

  @property({
    type: 'string',
    required: true,
  })
  deviceCategory: string; // EntityCategory should be saved before creating Device

  @property({
    type: 'string',
    required: true    
  })
  deviceSerialNo: string;

  @property({
    type: 'string',
    required: false    
  })
  deviceSKU: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: false,
  })
  label: string;

  @property({
    type: 'string',
    required: false,
  })
  description: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(DeviceStatus),
    },
    default: DeviceStatus.ADDED
  })
  status: DeviceStatus;

  @property({
    type: 'object',
    required: false,
  })
  deviceConfig: object;

  @property({
    type: 'object',
    required: false,
  })
  location: Location;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<Device>) {
    super(data);
  }
}

export interface DeviceRelations {
  // describe navigational properties here
}

export type DeviceWithRelations = Device & DeviceRelations;
