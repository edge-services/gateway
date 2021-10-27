import { model, property} from '@loopback/repository';
import { NotificationStrategyWhen } from './types';

@model({
    name: 'rule-event-param'
  })
  export class RuleEventParam {
  
    @property({
      type: 'string',
    })
    message?: string;
  
    @property({
      type: 'object',    
    })
    metadata?: object;
  
  }

@model({
  name: 'rule-event'
})
export class RuleEvent {

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'object',    
  })
  params?: RuleEventParam;

}

@model({
  name: 'notification-strategy'
})
export class NotificationStrategy {

  @property({
    type: 'string',
    required: true,
    default: NotificationStrategyWhen.EVERY_TIME,
    jsonSchema: {
      enum: Object.values(NotificationStrategyWhen),
    }
  })
  when: NotificationStrategyWhen;

  @property({
    type: 'number',    
  })
  count?: number;

  @property({
    type: 'number',    
  })
  timePeriod?: number;

}
