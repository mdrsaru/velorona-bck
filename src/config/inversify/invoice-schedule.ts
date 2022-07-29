import { ContainerModule, interfaces } from 'inversify';
import { IInvoiceScheduleRepository } from '../../interfaces/invoice-schedule.interface';
import InvoiceScheduleRepository from '../../repository/invoice-schedule.repository';

import { TYPES } from '../../types';

const invoiceSchedule = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IInvoiceScheduleRepository>(TYPES.InvoiceScheduleRepository).to(InvoiceScheduleRepository);
});

export default invoiceSchedule;
