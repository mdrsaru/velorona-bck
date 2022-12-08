import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import User from '../entities/user.entity';

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

@injectable()
export default class UserClientService implements IUserClientService {
  private name = 'UserClientkService';
  private userClientRepository: IUserClientRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private timesheetService: ITimesheetService;
  private timesheetRepository: ITimesheetRepository;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimesheetService) timesheetService: ITimesheetService,
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository
  ) {
    this.userClientRepository = _userClientRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timesheetService = timesheetService;
    this.timesheetRepository = timesheetRepository;
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

      let weekStartDate = moment(moment().format('YYYY-MM-DD')).startOf('isoWeek');

      const foundTimesheet = await this.timesheetRepository.getAll({
        query: {
          user_id,
          client_id,
          weekStartDate,
        },
      });

      if (!foundTimesheet.length) {
        this.timesheetService.bulkCreate({
          date: moment().format('YYYY-MM-DD'),
          user_id: user_id,
        });
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
