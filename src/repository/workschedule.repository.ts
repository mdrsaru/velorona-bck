import { inject, injectable } from 'inversify';
import { getRepository } from 'typeorm';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import strings from '../config/strings';

import Workschedule from '../entities/workschedule.entity';

import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import {
  IWorkscheduleCreateInput,
  IWorkscheduleRepository,
  IWorkscheduleUpdateInput,
} from '../interfaces/workschedule.interface';
import { ITaskRepository } from '../interfaces/task.interface';

@injectable()
export default class WorkscheduleRepository extends BaseRepository<Workschedule> implements IWorkscheduleRepository {
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private taskRepository: ITaskRepository;
  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.TaskRepository) _taskRepository: ITaskRepository
  ) {
    super(getRepository(Workschedule));
    this.companyRepository = _companyRepository;
    this.userRepository = _userRepository;
    this.taskRepository = _taskRepository;
  }

  create = async (args: IWorkscheduleCreateInput): Promise<Workschedule> => {
    try {
      const startDate = args.startDate;
      const endDate = args.endDate;
      const payrollAllocatedHours = args.payrollAllocatedHours;
      const payrollUsageHours = args.payrollUsageHours;
      const status = args.status;
      const company_id = args.company_id;

      const errors: string[] = [];

      if (isNil(startDate)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endDate)) {
        errors.push(strings.endDateRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }
      const found = await this.getAll({
        query: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (found.length > 0) {
        throw new apiError.ConflictError({
          details: [strings.workscheduleAlreadyExist],
        });
      }
      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const workschedule = await this.repo.save({
        startDate,
        endDate,
        payrollAllocatedHours,
        payrollUsageHours,
        status,
        company_id,
      });

      return workschedule;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IWorkscheduleUpdateInput): Promise<Workschedule> => {
    try {
      const id = args.id;
      const startDate = args.startDate;
      const endDate = args.endDate;
      const payrollAllocatedHours = args.payrollAllocatedHours;
      const payrollUsageHours = args.payrollUsageHours;
      const status = args.status;
      const company_id = args.company_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.workscheduleNotFound],
        });
      }
      const update = merge(found, {
        id,
        startDate,
        endDate,
        payrollAllocatedHours,
        payrollUsageHours,
        status,
        company_id,
      });

      let workschedule = await this.repo.save(update);

      return workschedule;
    } catch (err) {
      throw err;
    }
  };
}
