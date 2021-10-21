import { model, property} from '@loopback/repository';
import { NotificationStrateyWhen } from './types';

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
    default: NotificationStrateyWhen.EVERY_TIME,
    jsonSchema: {
      enum: Object.values(NotificationStrateyWhen),
    }
  })
  when: NotificationStrateyWhen;

  @property({
    type: 'number',    
  })
  count?: number;

  @property({
    type: 'number',    
  })
  timePeriod?: number;

}
