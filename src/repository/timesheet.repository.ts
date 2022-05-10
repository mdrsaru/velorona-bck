import { inject, injectable } from 'inversify';
import { isNil, isString, merge } from 'lodash';
import moment from 'moment';
import { getRepository } from 'typeorm';
import strings from '../config/strings';
import Timesheet from '../entities/timesheet.entity';
import { IClientRepository } from '../interfaces/client.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { ITimesheetCreateInput, ITimesheetRepository, ITimesheetUpdateInput } from '../interfaces/timesheet.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/api-error';
import BaseRepository from './base.repository';

@injectable()
export default class TimesheetRepository extends BaseRepository<Timesheet> implements ITimesheetRepository {
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    super(getRepository(Timesheet));
    this.userRepository = userRepository;
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
  }

  create = async (args: ITimesheetCreateInput): Promise<Timesheet> => {
    try {
      const weekStartDate = args.weekStartDate;
      const weekEndDate = args.weekEndDate;
      const totalHours = args.totalHours;
      const totalExpense = args.totalExpense;
      const status = args.status;
      const user_id = args.user_id;
      const client_id = args.client_id;
      const company_id = args.company_id;
      const approver_id = args.approver_id;

      const user = await this.userRepository.getById({ id: user_id });
      if (!user) {
        throw new NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const client = await this.clientRepository.getById({ id: client_id });

      if (!client) {
        throw new NotFoundError({
          details: [strings.clientNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });

      if (!company) {
        throw new NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const approver = await this.userRepository.getById({ id: approver_id });

      if (!approver) {
        throw new NotFoundError({
          details: [strings.approverNotFound],
        });
      }

      let startDate: any = moment(weekStartDate);
      let endDate: any = moment(weekEndDate);

      const duration = endDate.diff(startDate, 'days');

      if (duration != 7) {
        throw new ValidationError({ details: ['Start Date and End Date should be 7 days apart'] });
      }

      startDate = startDate.format('YYYY-MM-DD');
      endDate = endDate.format('YYYY-MM-DD');

      const timesheets = await this.repo.count({
        user_id,
        client_id,
        weekStartDate: startDate,
        weekEndDate: endDate,
      });

      if (timesheets > 0) {
        throw new ConflictError({ details: [strings.timesheetAlreadyExistWithSameDetail] });
      }

      const res = await this.repo.save({
        weekStartDate: startDate,
        weekEndDate: endDate,
        totalHours,
        totalExpense,
        status,
        user_id,
        client_id,
        company_id,
        approver_id,
      });

      return res;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args.id;
      const totalHours = args.totalHours;
      const totalExpense = args.totalExpense;
      const status = args.status;
      const user_id = args.user_id;
      const errors: string[] = [];

      if (isNil(id) || !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['Timesheet not found'],
        });
      }

      const update = merge(found, {
        id,
        totalHours,
        totalExpense,
        status,
      });

      let timesheet = await this.repo.save(update);

      return timesheet;
    } catch (err) {
      throw err;
    }
  };
}
