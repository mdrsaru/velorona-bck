import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import find from 'lodash/find';
import { inject, injectable } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import { Role as RoleEnum } from '../config/constants';
import strings from '../config/strings';
import Project from '../entities/project.entity';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IProjectCreateInput, IProjectRepository, IProjectUpdateInput } from '../interfaces/project.interface';
import { IClientRepository } from '../interfaces/client.interface';

@injectable()
export default class ProjectRepository extends BaseRepository<Project> implements IProjectRepository {
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;

  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository
  ) {
    super(getRepository(Project));
    this.companyRepository = _companyRepository;
    this.userRepository = _userRepository;
    this.clientRepository = _clientRepository;
  }

  create = async (args: IProjectCreateInput): Promise<Project> => {
    try {
      const name = args.name;
      const client_id = args.client_id;
      const company_id = args.company_id;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(client_id) || !isString(client_id)) {
        errors.push(strings.clientRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const client = await this.clientRepository.getById({ id: client_id });

      if (!client) {
        throw new apiError.NotFoundError({
          details: [strings.clientNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const project = await this.repo.save({
        name,
        client_id,
        company_id,
      });

      return project;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IProjectUpdateInput): Promise<Project> => {
    try {
      const id = args?.id;
      const name = args.name;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      const update = merge(found, {
        id,
        name,
      });

      let project = await this.repo.save(update);

      return project;
    } catch (err) {
      throw err;
    }
  };
}
