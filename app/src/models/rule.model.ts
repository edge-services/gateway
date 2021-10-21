import {model, property} from '@loopback/repository';
import { UserModifiableEntity } from './user-modifiable-entity.model';
import { EnvType } from '.';
import { RuleCondition } from './rule-condition.model';
import { NotificationStrategy, RuleEvent } from './rule-event.model';

@model({
  name: 'rules',
  settings: {strict: false}
})
export class Rule extends UserModifiableEntity {

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
      }
    })
    envType: EnvType;

    @property({
      type: 'string',
      required: true,
    })
    name: string; 

    @property({
      type: 'string',
      required: false,
    })
    description: string; 

    @property({
      type: 'object',
      required: true,
    })
    condition?: RuleCondition;

    @property({
      type: 'object',
      required: false,
    })
    event: RuleEvent;

    @property({
      type: 'object',
      required: false,
    })
    notificationStrategy: NotificationStrategy;
    
    @property({
      type: 'object',
      required: false,
    })
    metadata: object;

    @property({
      type: 'string',
      required: false,
    })
    tags?: string | undefined;

    constructor(data?: Partial<Rule>) {
        super(data);
    }

}

export interface RuleRelations {
  // describe navigational properties here
}

export type RuleWithRelations = Rule & RuleRelations;