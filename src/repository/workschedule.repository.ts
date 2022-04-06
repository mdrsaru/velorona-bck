import { inject, injectable } from 'inversify';
import { getRepository } from 'typeorm';
import isNil from 'lodash/isNil';
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
      const date = args.date;
      const from = args.from;
      const to = args.to;
      const task_id = args.task_id;
      const employee_id = args.employee_id;
      const company_id = args.company_id;

      const errors: string[] = [];

      if (isNil(task_id) || !isString(task_id)) {
        errors.push(strings.taskIdRequired);
      }
      if (isNil(employee_id) || !isString(employee_id)) {
        errors.push(strings.EmployeeIdRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const task = await this.taskRepository.getById({ id: task_id });
      if (!task) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }
      const employee = await this.userRepository.getById({ id: employee_id, relations: ['roles'] });
      if (!employee) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }
      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const workschedule = await this.repo.save({
        date,
        from,
        to,
        task_id,
        employee_id,
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
      const date = args.date;
      const from = args.from;
      const to = args.to;
      const task_id = args.task_id;
      const employee_id = args.employee_id;
      const company_id = args.company_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.workscheduleNotFound],
        });
      }
      const update = merge(found, {
        id,
        date,
        from,
        to,
        task_id,
        employee_id,
        company_id,
      });

      let workschedule = await this.repo.save(update);

      return workschedule;
    } catch (err) {
      throw err;
    }
  };
}
