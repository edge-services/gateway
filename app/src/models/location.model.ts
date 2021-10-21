import { model, property } from "@loopback/repository";

@model({
    name: 'location'
  })
  export class Location {
  
    @property({
      type: 'number',
    })
    lat?: number;
  
    @property({
      type: 'number',    
    })
    long?: number;
  
    @property({
      type: 'number',
    })
    alt?: number;
  
    @property({
      type: 'number',
    })
    x?: number;

    @property({
        type: 'number',
    })
    y?: number;

    @property({
        type: 'number',
    })
    z?: number;
  
  }