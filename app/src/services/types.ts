import { SystemInfo } from "../models";

export interface CommonServiceI {
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
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
    syncWithCloud(): Promise<void>; 
    fetchETLFunctions(payload: any, local: boolean): Promise<any> ; 
    fetchRules(payload: any, local: boolean): Promise<any> ;   
}