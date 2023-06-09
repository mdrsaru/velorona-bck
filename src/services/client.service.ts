import { injectable, inject } from 'inversify';

import {
  IClientCreateInput,
  IClientUpdateInput,
  IClientRepository,
  IClientService,
} from '../interfaces/client.interface';
import Client from '../entities/client.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
@injectable()
export default class ClientService implements IClientService {
  private clientRepository: IClientRepository;

  constructor(@inject(TYPES.ClientRepository) clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Client>> => {
    try {
      const { rows, count } = await this.clientRepository.getAllAndCount(args);

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

  create = async (args: IClientCreateInput): Promise<Client> => {
    try {
      const name = args.name;
      const email = args.email;
      const invoicingEmail = args.invoicingEmail;
      const company_id = args.company_id;
      const status = args.status;
      const archived = args?.archived;
      const address = args?.address;
      const phone = args.phone;
      const invoiceSchedule = args.invoiceSchedule;
      const invoice_payment_config_id = args.invoice_payment_config_id;
      const scheduleStartDate = args.scheduleStartDate;

      const client = await this.clientRepository.create({
        name,
        email,
        invoicingEmail,
        company_id,
        status,
        archived,
        address,
        phone,
        invoiceSchedule,
        invoice_payment_config_id,
        scheduleStartDate,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IClientUpdateInput): Promise<Client> => {
    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const address = args?.address;
      const phone = args?.phone;
      const invoiceSchedule = args.invoiceSchedule;
      const invoice_payment_config_id = args.invoice_payment_config_id;
      const email = args.email;
      const invoicingEmail = args.invoicingEmail;
      const scheduleStartDate = args.scheduleStartDate;

      const client = await this.clientRepository.update({
        id,
        name,
        status,
        archived,
        address,
        phone,
        invoiceSchedule,
        invoice_payment_config_id,
        email,
        invoicingEmail,
        scheduleStartDate,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Client> => {
    try {
      const id = args.id;

      const client = await this.clientRepository.remove({
        id,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };
}
