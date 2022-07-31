import { EventEmitter } from 'events';

class Emitter extends EventEmitter {}

export const userEmitter = new Emitter();
export const invoiceEmitter = new Emitter();
export const timesheetEmitter = new Emitter();
export const payRateEmitter = new Emitter();
export const timeEntryEmitter = new Emitter();
export const companyEmitter = new Emitter();
export const workscheduleEmitter = new Emitter();
