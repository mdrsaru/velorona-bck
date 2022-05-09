import moment from 'moment';
import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { inject, injectable } from 'inversify';
import { getRepository, LessThanOrEqual, MoreThanOrEqual, In, IsNull } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import { entities } from '../config/constants';
import * as apiError from '../utils/api-error';
import TimeEntry from '../entities/time-entry.entity';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { ITaskRepository } from '../interfaces/task.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryTotalDurationInput,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsRepoInput,
} from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IGetOptions, IGetAllAndCountResult } from '../interfaces/paging.interface';

@injectable()
export default class TimeEntryRepository extends BaseRepository<TimeEntry> implements ITimeEntryRepository {
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
    super(getRepository(TimeEntry));
    this.userRepository = userRepository;
    this.projectRepository = _projectRepository;
    this.companyRepository = _companyRepository;
    this.taskRepository = _taskRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<TimeEntry>> => {
    try {
      let { query = {}, ...rest } = args;

      // For array values to be used as In operator
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if ('afterStart' in query) {
        const startTime = query.afterStart;
        delete query.afterStart;
        query.startTime = MoreThanOrEqual(startTime);
      }

      if ('beforeEnd' in query) {
        const endTime = query.beforeEnd;
        delete query.beforeEnd;
        query.endTime = LessThanOrEqual(endTime);
      }

      const [rows, count] = await this.repo.findAndCount({
        where: query,
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

  getWeeklyDetails = async (args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const errors: string[] = [];

      if (isNil(startTime) || !isDate(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endTime) || !isDate(endTime)) {
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
        startTime: MoreThanOrEqual(startTime),
        endTime: LessThanOrEqual(endTime),
      };

      const timeEntry = await this.getAll({
        query,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  getTotalTimeInSeconds = async (args: ITimeEntryTotalDurationInput): Promise<number> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const created_by = args.user_id;
      const errors: string[] = [];

      if (isNil(startTime) || isEmpty(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endTime) || isEmpty(endTime)) {
        errors.push(strings.endDateRequired);
      }
      if (isNil(company_id) || !isDate(company_id)) {
        errors.push(strings.companyIdRequired);
      }
      if (isNil(project_id) || !isDate(project_id)) {
        errors.push(strings.projectIdRequired);
      }

      const { totalTime } = await this.repo
        .createQueryBuilder(entities.timeEntry)
        .select('SUM(duration)', 'totalTime')
        .where('company_id = :company_id', { company_id })
        .andWhere('project_id = :project_id', { project_id })
        .andWhere('created_by = :created_by', { created_by })
        .andWhere('startTime >= :startTime', { startTime })
        .andWhere('"endTime" <= :endTime', { endTime })
        .getRawOne();

      return totalTime ?? 0;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimeEntryCreateInput): Promise<TimeEntry> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;

      const errors: string[] = [];

      if (isNil(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(project_id) || isEmpty(project_id)) {
        errors.push(strings.projectIdRequired);
      }
      if (isNil(company_id) || isEmpty(company_id)) {
        errors.push(strings.companyRequired);
      }
      if (isNil(task_id) || isEmpty(task_id)) {
        errors.push(strings.taskIdRequired);
      }
      if (isNil(created_by) || isEmpty(created_by)) {
        errors.push(strings.userIdRequired);
      }
      if (!isNil(endTime) && !isNil(startTime) && endTime <= startTime) {
        errors.push(strings.endDateMustBeValidDate);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const activeTimeEntryCount = await this.repo.count({
        company_id,
        endTime: IsNull(),
      });

      if (activeTimeEntryCount) {
        throw new apiError.ValidationError({
          details: [strings.activeTimerNotStopped],
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

      const task = await this.taskRepository.getById({ id: task_id });
      if (!task) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      let duration: undefined | number = undefined;
      if (endTime) {
        const startDate = moment(startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
      }

      const timeEntry = await this.repo.save({
        startTime,
        endTime,
        duration,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimeEntryUpdateInput): Promise<TimeEntry> => {
    try {
      const id = args.id;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const approver_id = args.approver_id;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;
      let startTime = args.startTime;

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
          details: ['TimeEntry not found'],
        });
      }

      startTime = startTime ?? found.startTime;
      let duration: undefined | number = undefined;
      if (endTime) {
        if (endTime <= startTime) {
          throw new apiError.ValidationError({
            details: [strings.endDateMustBeValidDate],
          });
        }

        const startDate = moment(startTime ?? found.startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
      }

      const update = merge(found, {
        id,
        startTime,
        endTime,
        duration,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      let timeEntry = await this.repo.save(update);

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };
}
