import {BindingKey} from '@loopback/context';
import { CommonServiceI, RuleServiceI, RadioServiceI, GatewayServiceI, IoTServiceI, AuthServiceI, ETLFunctionServiceI, DataFlowServiceI } from './services/types';
import { SimulatorUtilityI } from './utils';

export namespace ServiceBindings {

  export const COMMON_SERVICE = BindingKey.create<CommonServiceI | undefined>(
    'common.service',
  );

  export const ETLFUNCTION_SERVICE = BindingKey.create<ETLFunctionServiceI | undefined>(
    'etlfunction.service',
  );

  export const DATA_FLOW_SERVICE = BindingKey.create<DataFlowServiceI | undefined>(
    'dataflow.service',
  );

  export const RULE_SERVICE = BindingKey.create<RuleServiceI | undefined>(
    'rule.service',
  );

  export const RADIO_SERVICE = BindingKey.create<RadioServiceI | undefined>(
    'radio.service',
  );

  export const GATEWAY_SERVICE = BindingKey.create<GatewayServiceI | undefined>(
    'gateway.service',
  );

  export const IOT_SERVICE = BindingKey.create<IoTServiceI | undefined>(
    'iot.service',
  );

  export const AUTH_SERVICE = BindingKey.create<AuthServiceI | undefined>(
    'auth.service',
  );

}

export namespace UtilityBindings {

  export const SIMULATOR_UTILITY = BindingKey.create<SimulatorUtilityI | undefined>(
    'simulator.utility',
  );
  
}