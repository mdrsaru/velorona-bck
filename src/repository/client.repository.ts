import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import { TYPES } from '../types';
import { ClientStatus } from '../config/constants';
import strings from '../config/strings';
import Client from '../entities/client.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { ICompanyRepository } from '../interfaces/company.interface';

import { IClient, IClientCreateInput, IClientUpdateInput, IClientRepository } from '../interfaces/client.interface';

@injectable()
export default class ClientRepository extends BaseRepository<Client> implements IClientRepository {
  private companyRepository: ICompanyRepository;

  constructor(@inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository) {
    super(getRepository(Client));
    this.companyRepository = _companyRepository;
  }

  create = async (args: IClientCreateInput): Promise<Client> => {
    console.log(args, 'args');
    try {
      const name = args.name?.trim();
      const email = args.email?.trim()?.toLowerCase();
      const invoicingEmail = args.invoicingEmail?.trim()?.toLowerCase();
      const status = args.status ?? ClientStatus.Active;
      const archived = args?.archived ?? false;
      const address = args.address;
      const company_id = args.company_id;
      const streetAddress = args.address?.streetAddress;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }
      if (isNil(invoicingEmail) || !isString(invoicingEmail)) {
        errors.push(strings.invoicingEmailRequired);
      }
      if (isNil(streetAddress) || !isString(streetAddress)) {
        errors.push(strings.streetAddressRequired);
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

      const client = await this.repo.save({
        name,
        email,
        invoicingEmail,
        status,
        archived,
        address,
        company_id,
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
      const streetAddress = args.address?.streetAddress;

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
