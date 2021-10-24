import { model, property } from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import { AttributeType, DataType, EntityType } from '.';

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
    required: false,
  })
  entityCategoryId: string;

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
  attributeType: AttributeType; // This can be Client Side (CS) | Server Side (SS) | Shared (SH) | Telemetry

  @property({
    type: 'string',
    required: false,
  })
  unit: string; // meters, centi-meter, celcius, fahrenheit etc.

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(DataType),
    },
  })
  dataType: DataType;

  @property({
    type: 'any',
    required: true,
  })
  attributeValue: any;

  @property({
    type: 'date',
    default: () => new Date(),
    name: 'ts',
  })
  ts?: Date;

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
