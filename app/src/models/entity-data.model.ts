import { model, property } from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import { AttributeType, EntityType } from '.';

@model({settings: {strict: false}})
export class EntityData extends UserModifiableEntity {

  @property({
    type: 'string',
    id: true,
    defaultFn: "uuidv4"
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  entityId: string;

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
    required: true,
  })
  attributeKey: string;

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
    required: false,
  })
  unit: string; // meters, centi-meter, celcius, fahrenheit etc.

  @property({
    type: 'Boolean',
    required: false,
  })
  booleanValue: Boolean;

  @property({
    type: 'number',
    required: false,
  })
  doubleValue: number;

  @property({
    type: 'string',
    required: true,
  })
  stringValue: string;

  @property({
    type: 'object',
    required: true,
  })
  objectValue: object;

  @property({
    type: 'date',
    default: () => new Date(),
    name: 'lastUpdatedTS',
  })
  lastUpdatedTS?: Date;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<EntityData>) {
    super(data);
  }
}

export interface EntityDataRelations {
  // describe navigational properties here
}

export type EntityDataWithRelations = EntityData & EntityDataRelations;
