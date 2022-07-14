import { SimulatorUtility } from './utils/simulator';
import { RuleServiceI } from './services/types';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import * as dotenv from "dotenv";
import {MySequence} from './sequence';
import { ServiceBindings, UtilityBindings } from './keys';
import { CommonService, RuleService, RadioService, GatewayService, AuthServiceProvider, DataFlowService, ETLFunctionService, EntityDataService, SensorTagService } from './services';
import { IoTService } from './services/iot.service';

export {ApplicationConfig};

export class EdgeGatewayApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    dotenv.config();
    let env_path = process.env.NODE_ENV;
    if(env_path){
      dotenv.config({ path: env_path });
    } 
    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // this.bind('datasources.config.auth').toClass(AuthDataSource).inScope(BindingScope.SINGLETON);

    this.bind(UtilityBindings.SIMULATOR_UTILITY).toClass(SimulatorUtility).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.COMMON_SERVICE).toClass(CommonService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.RULE_SERVICE).toClass(RuleService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.RADIO_SERVICE).toClass(RadioService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.ETLFUNCTION_SERVICE).toClass(ETLFunctionService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.DATA_FLOW_SERVICE).toClass(DataFlowService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.GATEWAY_SERVICE).toClass(GatewayService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.IOT_SERVICE).toClass(IoTService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.AUTH_SERVICE).toProvider(AuthServiceProvider).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.ENTITY_DATA_SERVICE).toClass(EntityDataService).inScope(BindingScope.SINGLETON);
    this.bind(ServiceBindings.SENSORTAG_SERVICE).toClass(SensorTagService).inScope(BindingScope.SINGLETON);


    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      }
    };
  }
}
