import { Attribute, EntityData, EntityType, SystemInfo } from "../models";

export interface CommonServiceI {
    getSystemDetails(): Promise<any>;
    getSystemInformation(valueObject: any): Promise<SystemInfo>;
    getSerialNumber(): Promise<string>;
    setItemInCache(key: string, content: any): Promise<void>;
    getItemFromCache(key: string): Promise<any>;
}

export interface AuthServiceI {
    getClientToken(clientId: string, secret: string): any;
    refreshAuthToken(tentantId: string, principalId: string, refreshToken: string): any;
}

export interface RadioServiceI {
    initRadio(): void;
    isAvailable(): boolean;
}

export interface SensorTagServiceI {
    initSensorTag(): void;
    getTags(): any;
    refreshSensorTag(tag: any): void;
    clean(): void;
}

export interface GatewayServiceI {
    initGateway(): void;
    restartGateway(): Promise<void>
    syncWithCloud(): void;
    getSystemDetails(): Promise<any>;
    getSystemInformation(valueObject: any): Promise<SystemInfo>;
}

export interface RuleServiceI {
    formatNAddRules(rules: Array<any>): Promise<void>;
    // addRules(rules: Array<any>): Promise<void>;
    execute(data: any): Promise<any>;
}

export interface ETLFunctionServiceI {
    execute(payload: any): Promise<any>;
}

export interface DataFlowServiceI {
    execute(payload: any): Promise<any>;
}

export interface EntityDataServiceI {
    insert(payload: EntityData): Promise<any>;
}

export interface IoTServiceI {
    initService(): void;
    syncWithCloud(): Promise<any>;
    fetchDevices(filter: any, isOnline: boolean): Promise<any>;
    fetchETLFunctions(payload: any, isOnline: boolean): Promise<any>;
    fetchRules(payload: any, isOnline: boolean): Promise<any>;
    fetchAttributes(entityType: EntityType, payload: any, isOnline: boolean): Promise<Attribute[]>;
    getMetaData(payload: any): Promise<any>;
}