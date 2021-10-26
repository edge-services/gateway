export const SystemInfoSchema = {
    type: 'object',
    properties: {
      cpu: {type: 'object'},
      osInfo: {type: 'object'},
      system: {type: 'object'},
      mem: {type: 'object'},
      battery: {type: 'object'}
    },
  };

  export const DataflowSchema = {
    type: 'object',
    properties: {
      uniqueId: {type: 'string'},
      type: {type: 'string'},
      entityCategoryId: {type: 'string'},
      d: {type: 'object'},
      event: {type: 'object'}
    },
  };

  export const EventSchema = {
    type: 'object',
    properties: {
      topic: {type: 'string'},
      metadata: {type: 'object'},
      d: {type: 'object'},
      event: {type: 'object'}
    },
  };