import { EventEmitter } from 'events';

class Emitter extends EventEmitter {}

export const userEmitter = new Emitter();
export const invoiceEmitter = new Emitter();
export const timesheetEmitter = new Emitter();
export const payRateEmitter = new Emitter();
