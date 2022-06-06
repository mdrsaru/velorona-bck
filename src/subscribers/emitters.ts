import { EventEmitter } from 'events';

class Emitter extends EventEmitter {}

export const userEmitter = new Emitter();
export const invoiceEmitter = new Emitter();