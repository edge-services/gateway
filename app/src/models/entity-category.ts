import { UserModifiableEntity } from './user-modifiable-entity.model';
import {model, property} from '@loopback/repository';
// import { Attribute } from './attribute.model';
import { EntityType } from '.';
// import {v4 as uuid} from 'uuid';

@model({
  name: 'entityCategories',
  settings: {strict: false}
})
export class EntityCategory extends UserModifiableEntity {
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
    required: true,
    index: true
  })
  name?: string;

  @property({
    type: 'string'    
  })
  label?: string;

  @property({
    type: 'string',
    required: false,
  })
  description?: string | undefined;

  // @property({
  //   type: 'boolean',
  //   required: false,
  //   default: false
  // })
  // isGateway: boolean;

  @property({
    type: 'object',
    required: false,
  })
  entityCategoryConfig: object;

//   @property({
//     type: 'array',
//     itemType: Attribute
//   })
//   attributes?: Attribute[];

 
  // Define well-known properties here

  constructor(data?: Partial<EntityCategory>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface EntityCategoryRelations {
  // describe navigational properties here
}

export type EntityCategoryWithRelations = EntityCategory & EntityCategoryRelations;


