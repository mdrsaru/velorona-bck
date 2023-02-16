import { injectable, inject } from 'inversify';

import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import { InvoiceStatus, events, TimesheetStatus } from '../config/constants';
import Invoice from '../entities/invoice.entity';
import Client from '../entities/client.entity';
import InvoiceItem from '../entities/invoice-item.entity';
import Address from '../entities/address.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import invoiceEmitter from '../subscribers/invoice.subscriber';
import PDFService from '../services/pdf.service';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID, ILogger } from '../interfaces/common.interface';
import {
  IInvoiceCreateInput,
  IInvoiceUpdateInput,
  IInvoiceRepository,
  IInvoiceService,
  IInvoiceScheduleInput,
  IInvoiceUpdateServiceInput,
} from '../interfaces/invoice.interface';
import { IInvoiceItemRepository } from '../interfaces/invoice-item.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';

@injectable()
export default class InvoiceService implements IInvoiceService {
  private invoiceRepository: IInvoiceRepository;
  private invoiceItemRepository: IInvoiceItemRepository;
  private clientRepository: IClientRepository;
  private userRepository: IUserRepository;
  private timeEntryRepository: ITimeEntryRepository;
  private timesheetRepository: ITimesheetRepository;
  private attachedTimesheetRepository: IAttachedTimesheetRepository;
  private pdfService: any;
  private logger: ILogger;

  constructor(
    @inject(TYPES.InvoiceRepository) _invoiceRepository: IInvoiceRepository,
    @inject(TYPES.InvoiceItemRepository) _invoiceItemRepository: IInvoiceItemRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository,
    @inject(TYPES.AttachedTimesheetRepository) _attachedTimesheetRepository: IAttachedTimesheetRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.invoiceRepository = _invoiceRepository;
    this.pdfService = new PDFService();
    this.invoiceItemRepository = _invoiceItemRepository;
    this.clientRepository = _clientRepository;
    this.userRepository = _userRepository;
    this.timeEntryRepository = _timeEntryRepository;
    this.timesheetRepository = _timesheetRepository;
    this.attachedTimesheetRepository = _attachedTimesheetRepository;
    this.logger = loggerFactory('InvoiceService');
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Invoice>> => {
    try {
      const { rows, count } = await this.invoiceRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IInvoiceCreateInput): Promise<Invoice> => {
    try {
      const timesheet_id = args.timesheet_id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const discount = args.discount;
      const shipping = args.shipping;
      const needProject = args.needProject;
      const startDate = args.startDate;
      const endDate = args.endDate;
      const user_id = args.user_id;
      const items = args.items;
      const attachments = args.attachments;

      const invoice = await this.invoiceRepository.create({
        timesheet_id,
        status,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        taxAmount,
        notes,
        company_id,
        client_id,
        discount,
        shipping,
        needProject,
        startDate,
        endDate,
        user_id,
        items,
        attachments,
      });

      const timesheets = await this.timesheetRepository.getAllAndCount({
        query: {
          weekStartDate: startDate,
          weekEndDate: endDate,
          user_id,
          company_id,
          client_id,
          status: TimesheetStatus.Approved,
        },
      });

      if (timesheets.rows.length) {
        timesheets.rows.map(async (timesheet) => {
          try {
            await this.attachedTimesheetRepository.updateTimesheetAttachmentWithInvoice({
              invoice_id: invoice.id,
              timesheet_id: timesheet.id,
            });
          } catch (err) {
            this.logger.error({
              operation: 'create',
              message: 'Error updating timesheet attachments with invoice',
            });
          }
        });
      }

      if (invoice.status === InvoiceStatus.Sent) {
        invoiceEmitter.emit(events.sendInvoice, {
          invoice,
          timesheet_id,
        });
      }

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvoiceUpdateServiceInput): Promise<Invoice> => {
    try {
      const id = args.id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const discount = args.discount;
      const shipping = args.shipping;
      const needProject = args.needProject;
      const items = args.items;
      const sendEmail = args.sendEmail;

      const found = await this.invoiceRepository.getById({
        id,
        select: ['id', 'status'],
      });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.invoiceNotFound],
        });
      }

      if (found.status === InvoiceStatus.Received && status === InvoiceStatus.Pending) {
        throw new apiError.ValidationError({
          details: [strings.invoiceReceivedToPendingError],
        });
      }

      const invoice = await this.invoiceRepository.update({
        id,
        status,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        taxAmount,
        notes,
        items,
        discount,
        shipping,
        needProject,
      });

      if (invoice.timesheet_id) {
        try {
          await this.attachedTimesheetRepository.updateTimesheetAttachmentWithInvoice({
            invoice_id: invoice.id,
            timesheet_id: invoice.timesheet_id,
          });
        } catch (err) {
          this.logger.error({
            operation: 'update',
            message: 'Error updating timesheet attachments with invoice',
          });
        }
      }

      if (sendEmail || (found.status !== invoice.status && invoice.status === InvoiceStatus.Sent)) {
        invoiceEmitter.emit(events.sendInvoice, {
          invoice,
          timesheet_id: invoice.timesheet_id,
        });
      }

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Invoice> => {
    try {
      const id = args.id;

      const invoice = await this.invoiceRepository.remove({
        id,
      });

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  getPDF = async (args: { id: string }): Promise<string> => {
    try {
      const id = args.id;

      const invoice = (await this.invoiceRepository.getById({
        id,
        relations: ['client', 'client.address', 'company'],
      })) as Invoice;

      const items: InvoiceItem[] = await this.invoiceItemRepository.getAll({
        query: {
          invoice_id: invoice.id,
        },
        relations: ['project'],
      });

      let companyAddress: Address | undefined;
      if (invoice?.company?.adminEmail) {
        const user = await this.userRepository.getAll({
          query: {
            email: invoice.company.adminEmail,
            company_id: invoice.company?.id,
          },
          select: ['id'],
          relations: ['address'],
        });

        if (user.length) {
          companyAddress = user?.[0]?.address;
        }
      }

      invoice.items = items;

      const pdf = await this.pdfService.generateInvoicePdf({
        invoice,
        companyAddress,
      });

      return pdf.toString('base64');
    } catch (err) {
      throw err;
    }
  };

  /**
   * Not needed now, might need in the future for reference
  createInvoiceFromScheduleDate = async (args: IInvoiceScheduleInput): Promise<Invoice[]> => {
    try {
      const date = args.date;

      const schedules = await this.invoiceScheduleRepository.getAll({
        query: {
          scheduleDate: date,
        },
        select: ['id', 'timesheet_id', 'scheduleDate'],
      });

      const promises = [];
      for (let schedule of schedules) {
        const timesheet = await this.timesheetRepository.getById({
          id: schedule.timesheet_id,
        });

        if (!timesheet) {
          continue;
        }

        const startTime = timesheet.weekStartDate + 'T00:00:00';
        const endTime = timesheet.weekEndDate + 'T23:59:59';
        const client_id = timesheet.client_id;
        const company_id = timesheet.company_id;
        const user_id = timesheet.user_id;

        const projectItems = await this.timeEntryRepository.getProjectItems({
          client_id,
          company_id,
          startTime,
          endTime,
          user_id,
        });

        let totalAmount = 0;
        let totalQuantity = 0;
        const poNumber = '';
        const subtotal = 0;
        const taxPercent = 0;
        const taxAmount = 0;
        const notes = '';
        const issueDate = new Date(schedule.scheduleDate);
        const dueDate = new Date(schedule.scheduleDate);

        const items = projectItems.map((item) => {
          const quantity = item.totalHours;
          totalAmount += item.totalExpense;
          totalQuantity += quantity;

          return {
            project_id: item.project_id,
            description: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
            quantity: quantity,
            rate: item.hourlyRate,
            amount: item.totalExpense,
          };
        });

        if (projectItems?.length) {
          const promise = this.invoiceRepository.create({
            timesheet_id: timesheet.id,
            status: InvoiceStatus.Pending,
            issueDate,
            dueDate,
            poNumber,
            totalQuantity,
            subtotal,
            totalAmount,
            taxPercent,
            taxAmount,
            notes,
            company_id,
            client_id,
            items,
          });

          promises.push(promise);
        }
      }

      const result = await Promise.all(promises);
      return result;
    } catch (err) {
      throw err;
    }
  };
  */
}
