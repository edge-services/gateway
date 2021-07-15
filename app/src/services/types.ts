import { SystemInfo } from "../models";

export interface CommonServiceI {
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
    setItemInCache(key: string, content: any): Promise<void>;
    getItemFromCache(key: string): Promise<any>;
}

export interface RadioServiceI {
    initRadio(): void;
    isAvailable(): boolean;
}

export interface GatewayServiceI {
    initGateway(): void;   
    syncWithCloud(): void;
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
}

export interface RuleServiceI {
    formatNAddRules(rules: Array<any>): Promise<void>;
    addRules(rules: Array<any>): Promise<void>;
    processRules(data: any): Promise<void>;
}

export interface IoTServiceI {
    initService(): void;   
    fetchRules(payload: any): Promise<any> ;   
}