import { model, property} from '@loopback/repository';
import { EntityType, EnvType } from '.';


@model({
  name: 'metadata'
})
export class Metadata {

  @property({
    type: 'string',
  })
  tenantId?: string;

  @property({
    type: 'string',    
  })
  manufacturerId?: string;

  @property({
    type: 'string',
  })
  accountId?: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(EntityType),
    },
  })
  entityType: EntityType;

  @property({
    type: 'string',
  })
  entityCategoryId: string;

  @property({
    type: 'string',
  })
  entityId?: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(EnvType),
    },
    default: EnvType.CLOUD
  })
  envType: EnvType;

  @property({
    type: 'object',    
  })
  tags?: string[];

}
