import { Request, RestBindings, get, ResponseObject, post, requestBody, getModelSchemaRef, api } from '@loopback/rest';
import { inject } from '@loopback/core';
import { SystemInfoRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { ServiceBindings } from '../keys';
import { DataflowSchema, EventSchema, SystemInfoSchema } from './specs/gatewaay-controller.spec';
import { SystemInfo } from '../models/system-info.model';
import { DataFlowServiceI, GatewayServiceI } from '../services';

@api({ basePath: '/api/gateway', paths: {} })
export class GatewayController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject(ServiceBindings.GATEWAY_SERVICE) private gatewayService: GatewayServiceI,
    @inject(ServiceBindings.DATA_FLOW_SERVICE) private dataFlowService: DataFlowServiceI,
    @repository(SystemInfoRepository)
    private systemInfoRepository: SystemInfoRepository,
  ) { }

  // Map to `GET /system`
  @get('/system', {
    responses: {
      '200': {
        description: 'System Information',
        content: { 'application/json': { schema: getModelSchemaRef(SystemInfo) } },
      },
    },
  })
  async systemDetails(): Promise<any> {
    return await this.gatewayService.getSystemDetails();
  }


  @post('/system', {
    responses: {
      '200': {
        description: 'System Information',
        content: { 'application/json': { schema: getModelSchemaRef(SystemInfo) } },
      },
    },
  })
  async systemInfo(
    @requestBody({
      content: {
        'application/json': {
          content: { 'application/json': { schema: SystemInfoSchema } },
        },
      },
    })
    payload: typeof SystemInfoSchema,
  ): Promise<SystemInfo> {
    console.log('IN getSystemInformation with Payload: >>> ', payload);
    let systemInfo: SystemInfo = await this.gatewayService.getSystemInformation(payload);
    // systemInfo = await this.systemInfoRepository.create(systemInfo);
    console.log(systemInfo);
    return systemInfo;
  }

  @post('/data-flow', {
    responses: {
      '200': {
        description: 'Data Flow for processing Edge Functions and Edge Rules',
        content: { 'application/json': { schema: DataflowSchema } },
      },
    },
  })
  async dataFlow(
    @requestBody({
      content: {
        'application/json': {
          content: { 'application/json': { schema: DataflowSchema } },
        },
      },
    })
    payload: typeof DataflowSchema,
  ): Promise<any> {
    console.log('IN GatewayController.dataFlow with Payload: >>> ', payload);
    try {
      return this.dataFlowService.execute(payload);
    } catch (error) {
      Promise.reject(error);
    }
  }


  @post('/event', {
    responses: {
      '200': {
        description: 'Some Event triggered...',
        content: { 'application/json': { schema: EventSchema } },
      },
    },
  })
  async eventTriggered(
    @requestBody({
      content: {
        'application/json': {
          content: { 'application/json': { schema: EventSchema } },
        },
      },
    })
    payload: typeof EventSchema,
  ): Promise<any> {
    console.log('IN GatewayController.eventTriggered with Payload: >>> ', payload);
    try {
      return this.gatewayService.restartGateway();
    } catch (error) {
      Promise.reject(error);
    }
  }

}
