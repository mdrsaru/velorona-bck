/**
 * Not needed for now.
 */
import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Base } from './base.entity';
import Timesheet from './timesheet.entity';
import { entities } from '../config/constants';

//const entity = entities.invoiceSchedule;

//@Entity({ name: entity })
//export default class InvoiceSchedule extends Base {
//@Index(`${entity}_schedule_date`)
//@Column({ type: 'date', name: 'schedule_date' })
//scheduleDate: Date;

//@ManyToOne(() => Timesheet)
//@JoinColumn({ name: 'timesheet_id' })
//timesheet: Timesheet;

//@Index(`${entity}_timesheet_id`)
//@Column({ unique: true })
//timesheet_id: string;
//}
