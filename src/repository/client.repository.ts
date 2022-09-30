import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository, Repository, In, ILike, FindConditions } from 'typeorm';

import { TYPES } from '../types';
import { ClientStatus } from '../config/constants';
import strings from '../config/strings';
import Client from '../entities/client.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { IClient, IClientCreateInput, IClientUpdateInput, IClientRepository } from '../interfaces/client.interface';

@injectable()
export default class ClientRepository extends BaseRepository<Client> implements IClientRepository {
  private companyRepository: ICompanyRepository;

  constructor(@inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository) {
    super(getRepository(Client));
    this.companyRepository = _companyRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Client>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { search, ...where } = query;
      const _select = select as (keyof Client)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      let _searchWhere: FindConditions<Client[]> = [];

      if (search) {
        _searchWhere = [
          {
            name: ILike(`%${search}%`),
            ...where,
          },
          {
            email: ILike(`%${search}%`),
            ...where,
          },
        ];
      }

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _searchWhere.length ? _searchWhere : where,
        ...(_select?.length && { select: _select }),
        ...rest,
      });

      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IClientCreateInput): Promise<Client> => {
    try {
      const name = args.name?.trim();
      const email = args.email?.trim()?.toLowerCase();
      const invoicingEmail = args.invoicingEmail?.trim()?.toLowerCase();
      const status = args.status ?? ClientStatus.Active;
      const archived = args?.archived ?? false;
      const address = args.address;
      const company_id = args.company_id;
      const streetAddress = args.address?.streetAddress;
      const phone = args.phone;
      const invoiceSchedule = args.invoiceSchedule;
      const invoice_payment_config_id = args.invoice_payment_config_id;
      const scheduleStartDate = args.scheduleStartDate;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }
      if (isNil(streetAddress) || !isString(streetAddress)) {
        errors.push(strings.streetAddressRequired);
      }
      if (isNil(phone) || !isString(phone)) {
        errors.push(strings.phoneRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      // check for duplicate email with company
      const foundClient = await this.repo.count({
        where: {
          email,
          company_id,
        },
      });

      if (foundClient) {
        throw new apiError.ConflictError({
          details: [strings.clientExists],
        });
      }

      const client = await this.repo.save({
        name,
        email,
        invoicingEmail,
        status,
        archived,
        address,
        company_id,
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
      const name = args.name?.trim();
      const status = args.status;
      const archived = args?.archived ?? false;
      const address = args.address;
      const phone = args.phone;
      const streetAddress = args.address?.streetAddress;
      const invoiceSchedule = args.invoiceSchedule;
      const invoice_payment_config_id = args.invoice_payment_config_id;
      const invoicingEmail = args.invoicingEmail;
      const scheduleStartDate = args.scheduleStartDate;

      const errors: string[] = [];

      if (isNil(id) && !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id, relations: ['address'] });

      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Client not found'],
        });
      }

      const update: Client = merge(found, {
        id,
        name,
        status,
        archived,
        phone,
        invoiceSchedule,
        invoicingEmail,
        invoice_payment_config_id,
        scheduleStartDate,
        ...(!!address && {
          address: {
            ...(found.address ?? {}),
            ...address,
          },
        }),
      });

      const client = await this.repo.save(update);

      return client;
    } catch (err) {
      throw err;
    }
  };
}
