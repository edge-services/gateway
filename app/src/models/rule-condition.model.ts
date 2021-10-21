import { model, property} from '@loopback/repository';
import { RuleConditionType } from '.';
// import { RuleFact } from './rule-fact.model';

@model({
    name: 'rule-fact'
  })
  export class RuleFact {
  
    @property({
      type: 'string',
    })
    key?: string;
  
    @property({
      type: 'string',    
    })
    operator?: string;
  
    @property({
      type: 'string',
    })
    value?: string;
  
    @property({
      type: 'string',
    })
    path?: string;
  
  }
  

@model({
  name: 'rule-condition'
})
export class RuleCondition {

  @property({
    type: 'string',
    jsonSchema: {
        enum: Object.values(RuleConditionType),
    }
  })
  type: RuleConditionType; // all | any | fact

  @property({
    type: 'object',    
  })
  fact?: RuleFact;

  @property({
    type: 'object',
  })
  children?: RuleCondition[];

}
