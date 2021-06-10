import { SystemInfo } from "../models";

export interface CommonServiceI {
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
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
    addRules(rules: Array<any>): Promise<void>;
    processRules(data: any): Promise<void>;
}