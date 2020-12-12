import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class OrdersEventManager extends EventEmitter {
  publish(event: string, payload: any) {
    this.emit(event, payload);
  }

  subscribe(event: string, callback: (payload: any) => any) {
    this.on(event, callback);
  }
}
