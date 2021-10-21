
  export enum EntityType {
    TENANT = 'TENANT',
    CUSTOMER = 'CUSTOMER',
    USER = 'USER',
    DASHBOARD = 'DASHBOARD',
    ASSET = 'ASSET',
    DEVICE = 'DEVICE',
    DEVICE_TYPE = 'DEVICE_TYPE',
    RULE = 'RULE',
    FUNCTION = 'FUNCTION',
    FLOW = 'FLOW',
    ALARM = 'ALARM',
    ENTITY_VIEW = 'ENTITY_VIEW',     
    OTHER = 'other'
  }
  
  export enum AttributeType {
    CLIENT_SIDE = 'CLIENT_SIDE',
    SERVER_SIDE = 'SERVER_SIDE',
    SHARED = 'SHARED',
    TELEMETRY = 'TELEMETRY'
  }

  export enum EntityRelationType {
    CONTAINS = 'CONTAINS',
    MANAGES = 'MANAGES'    
  }

  export enum AccessType {
    READ = 'READ',
    WRITE = 'WRITE',
    DELETE  = 'DELETE'  
  }
  
  export const enum RelationTypeGroup {
    COMMON = 'COMMON',
    ALARM = 'ALARM',
    DASHBOARD = 'DASHBOARD',
    RULE_CHAIN = 'RULE_CHAIN',
    RULE_NODE = 'RULE_NODE',
  }

  export enum RuleConditionType {
    ANY = 'any',
    ALL = 'all',
    FACT = 'fact',
  }

  export enum EnvType {
    EDGE = 'edge',
    CLOUD = 'cloud'    
  }

  export enum NotificationStrateyWhen {
    EVERY_TIME = 'every-time',
    BECOMES_TRUE = 'becomes-true',
    PERSISTS = 'persists',
    X_IN_Y = 'x-in-y'    
  }

  export enum DeviceStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    CLAIMED = 'CLAIMED',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED'  
  }