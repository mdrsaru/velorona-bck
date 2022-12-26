import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import * as apiError from '../utils/api-error';

import { IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IUserClientCreate,
  IUserClientRepository,
  IUserClientService,
  IUserClientMakeInactive,
  IUserClientChangeStatus,
} from '../interfaces/user-client.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import UserClient from '../entities/user-client.entity';
import Paging from '../utils/paging';
import { ITimesheetRepository, ITimesheetService } from '../interfaces/timesheet.interface';
import moment from 'moment';
import { IUserRepository } from '../interfaces/user.interface';
import strings from '../config/strings';
import { format } from 'winston';
import { EntryType, Role, UserClientStatus } from '../config/constants';

@injectable()
export default class UserClientService implements IUserClientService {
  private name = 'UserClientkService';
  private userClientRepository: IUserClientRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private timesheetService: ITimesheetService;
  private timesheetRepository: ITimesheetRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimesheetService) timesheetService: ITimesheetService,
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.userClientRepository = _userClientRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timesheetService = timesheetService;
    this.timesheetRepository = timesheetRepository;
    this.userRepository = _userRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<UserClient>> => {
    try {
      const { rows, count } = await this.userClientRepository.getAllAndCount(args);

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

  associate = async (args: IUserClientCreate) => {
    const operation = 'create';

    const user_id = args.user_id;
    const client_id = args.client_id;

    try {
      const userClient = await this.userClientRepository.create({
        client_id,
        user_id,
      });

      return userClient;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  changeStatus = async (args: IUserClientChangeStatus): Promise<UserClient> => {
    const operation = 'changeStatus';

    const user_id = args.user_id;
    const client_id = args.client_id;
    const status = args.status;
    try {
      const userClient = await this.userClientRepository.update({
        user_id,
        client_id,
        status,
      });
      if (status === UserClientStatus.Active) {
        let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });

        if (!user) {
          throw new apiError.NotFoundError({ details: [strings.userNotFound] });
        }

        if (user.roles?.[0]?.name === Role.Employee && user.entryType === EntryType.Timesheet) {
          const startDate = user.startDate;

          const input = moment(startDate);
          const firstDayOfMonth = input.clone().startOf('month').format('YYYY-MM-DD');

          const firstWeekStartDate = moment(firstDayOfMonth).startOf('isoWeek');

          let weekStartDate;
          if (moment(firstDayOfMonth).format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
            const foundTimesheet = await this.timesheetRepository.getAll({
              query: {
                user_id,
                client_id,
                weekStartDate: firstWeekStartDate,
              },
            });

            if (!foundTimesheet.length) {
              this.timesheetService.bulkUserTimesheetCreate({
                date: moment(firstWeekStartDate).format('YYYY-MM-DD'),
                user,
                client_id,
              });
            }
          } else {
            weekStartDate = moment(user.startDate).startOf('isoWeek');
            const foundTimesheet = await this.timesheetRepository.getAll({
              query: {
                user_id,
                client_id,
                weekStartDate: weekStartDate,
              },
            });
            if (!foundTimesheet.length) {
              this.timesheetService.bulkUserTimesheetCreate({
                date: moment(weekStartDate).format('YYYY-MM-DD'),
                user,
                client_id,
              });
            }
            do {
              weekStartDate = moment(weekStartDate).isoWeekday(-6).format('YYYY-MM-DD');
              const foundTimesheet = await this.timesheetRepository.getAll({
                query: {
                  user_id,
                  client_id,
                  weekStartDate: weekStartDate,
                },
              });

              if (!foundTimesheet.length) {
                this.timesheetService.bulkUserTimesheetCreate({
                  date: moment(weekStartDate).format('YYYY-MM-DD'),
                  user,
                  client_id,
                });
              }
            } while (firstWeekStartDate.format('YYYY-MM-DD') !== moment(weekStartDate).format('YYYY-MM-DD'));
          }
        }
      }
      return userClient;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
}
