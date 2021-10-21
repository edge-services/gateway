import { EntityInfo } from './entity-info.model';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import {model, property} from '@loopback/repository';
import { AccessType, EntityRelationType } from '.';


@model({
    name: 'entity-relations',
    settings: {strict: false}
})
export class EntityRelation extends UserModifiableEntity {

  @property({
    type: 'string',
    id: true,
    defaultFn: "uuidv4"
  })
  id?: string;
  
  @property({
    type: 'object',
    required: true,
    index: true
  })
  from?: EntityInfo;

  @property({
    type: 'object',
    required: true,
    index: true
  })
  to?: EntityInfo;

  @property({
    type: 'string',
    required: true,
    index: true,
    jsonSchema: {
      enum: Object.values(EntityRelationType),
    }
  })
  type?: EntityRelationType;

  @property({
    type: 'string',
    required: false,
  })
  description?: string | undefined;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(AccessType),
    }
  })
  access?: AccessType;

 
  // Define well-known properties here

  constructor(data?: Partial<EntityRelation>) {
    super(data);
    // if (data != null && typeof data === 'object') {
    //   Object.assign(this, data);
    // }
  }
}

export interface EntityRelationRelations {
  // describe navigational properties here
}

export type EntityRelationWithRelations = EntityRelation & EntityRelationRelations;


