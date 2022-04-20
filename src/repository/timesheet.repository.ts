import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository } from 'typeorm';
import strings from '../config/strings';
import Timesheet from '../entities/timesheet.entity';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { ITimesheetCreateInput, ITimesheetRepository, ITimesheetUpdateInput } from '../interfaces/timesheet.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';

import * as apiError from '../utils/api-error';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

@injectable()
export default class TimesheetRepository extends BaseRepository<Timesheet> implements ITimesheetRepository {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository
  ) {
    super(getRepository(Timesheet));
    this.userRepository = userRepository;
    this.projectRepository = _projectRepository;
    this.companyRepository = _companyRepository;
  }

  async create(args: ITimesheetCreateInput): Promise<Timesheet> {
    try {
      const total_hours = args.total_hours;
      const total_expense = args.total_expense;
      const client_location = args.client_location;
      const approver_id = args.approver_id;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;

      const approver = await this.userRepository.getById({ id: approver_id, relations: ['roles'] });
      if (!approver) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const creator = await this.userRepository.getById({ id: created_by, relations: ['roles'] });
      if (!creator) {
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

      const project = await this.projectRepository.getById({ id: project_id });
      if (!project) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }
      const Timesheet = this.repo.save({
        total_hours,
        total_expense,
        client_location,
        approver_id,
        project_id,
        company_id,
        created_by,
      });
      return Timesheet;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args?.id;
      const total_hours = args.total_hours;
      const total_expense = args.total_expense;
      const client_location = args.client_location;
      const approver_id = args.approver_id;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['Timesheet not found'],
        });
      }

      const update = merge(found, {
        id,
        total_hours,
        total_expense,
        client_location,
        approver_id,
        project_id,
        company_id,
        created_by,
      });
      let Timesheet = await this.repo.save(update);

      return Timesheet;
    } catch (err) {
      throw err;
    }
  };
}
