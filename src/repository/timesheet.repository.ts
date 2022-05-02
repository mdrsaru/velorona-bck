import { inject, injectable } from 'inversify';
import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import { getRepository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import Timesheet from '../entities/timesheet.entity';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { ITaskRepository } from '../interfaces/task.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetUpdateInput,
  ITimesheetWeeklyDetailsRepoInput,
} from '../interfaces/timesheet.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class TimesheetRepository extends BaseRepository<Timesheet> implements ITimesheetRepository {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  private taskRepository: ITaskRepository;
  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.TaskRepository) _taskRepository: ITaskRepository
  ) {
    super(getRepository(Timesheet));
    this.userRepository = userRepository;
    this.projectRepository = _projectRepository;
    this.companyRepository = _companyRepository;
    this.taskRepository = _taskRepository;
  }

  getWeeklyDetails = async (args: ITimesheetWeeklyDetailsRepoInput): Promise<Timesheet[]> => {
    try {
      const start = args.start;
      const end = args.end;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const errors: string[] = [];

      if (isNil(start) || !isDate(start)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(end) || !isDate(end)) {
        errors.push(strings.endDateRequired);
      }
      if (isNil(company_id) || !isDate(company_id)) {
        errors.push(strings.companyIdRequired);
      }
      if (isNil(created_by) || !isDate(created_by)) {
        errors.push(strings.userIdRequired);
      }

      const query = {
        company_id,
        created_by,
        start: MoreThanOrEqual(start),
        end: LessThanOrEqual(end),
      };

      const timesheet = await this.getAll({
        query,
      });

      return timesheet;
    } catch (err) {
      throw err;
    }
  };

  async create(args: ITimesheetCreateInput): Promise<Timesheet> {
    try {
      const start = args.start;
      const end = args.end;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;

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

      const task = await this.taskRepository.getById({ id: task_id });
      if (!task) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      const timesheet = this.repo.save({
        start,
        end,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      return timesheet;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args.id;
      const start = args.start;
      const end = args.end;
      const clientLocation = args.clientLocation;
      const approver_id = args.approver_id;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;

      const errors: string[] = [];

      if (isNil(id) || !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
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
        start,
        end,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      let timesheet = await this.repo.save(update);

      return timesheet;
    } catch (err) {
      throw err;
    }
  };
}
