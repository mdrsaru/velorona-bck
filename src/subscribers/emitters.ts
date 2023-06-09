import { EventEmitter } from 'events';

class Emitter extends EventEmitter {}

export const userEmitter = new Emitter();
export const invoiceEmitter = new Emitter();
export const timesheetEmitter = new Emitter();
export const payRateEmitter = new Emitter();
export const timeEntryEmitter = new Emitter();
export const companyEmitter = new Emitter();
export const workscheduleEmitter = new Emitter();
export const workscheduleDetailEmitter = new Emitter();
export const subscriptionEmitter = new Emitter();
export const demoRequestEmitter = new Emitter();
