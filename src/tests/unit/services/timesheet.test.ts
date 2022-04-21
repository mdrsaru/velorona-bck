import { IErrorService, ILogger } from '../../../interfaces/common.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetService,
  ITimesheetUpdateInput,
} from '../../../interfaces/timesheet.interface';
import container from '../../../inversify.config';
import * as apiError from '../../../utils/api-error';
import { TYPES } from '../../../types';
import { timesheets } from '../../mock/data';
import TimesheetRepository from '../../mock//timesheet.repository';

describe('Timesheet Service', () => {
  let timesheetService: ITimesheetService;
  let errorService: IErrorService;
  let logger: ILogger;
  beforeAll(() => {
    container.rebind<ITimesheetRepository>(TYPES.TimesheetRepository).to(TimesheetRepository);
    timesheetService = container.get<ITimesheetService>(TYPES.TimesheetService);
    errorService = container.get<IErrorService>(TYPES.ErrorService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined project service instance', () => {
      expect(timesheetService).toBeDefined();
    });

    it('should return projects with pagination', async () => {
      const _timesheets = await timesheetService.getAllAndCount({});

      expect(_timesheets).toBeDefined();
      expect(_timesheets.data.length).toBe(timesheets.length);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const args: ITimesheetCreateInput = {
        total_hours: 10,
        total_expense: 100000,
        client_location: 'Lalitpur',
        approver_id: '3dc646b8-2cdc-4b20-b8bb-c8af70a62cdb',
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        company_id: 'b585d580-3e1b-4c07-8e51-9e38eddadf24',
        created_by: '26124a58-9167-45eb-a3b3-13163f263309',
      };

      const timesheet = await timesheetService.create(args);

      expect(timesheet).toBeDefined();

      expect(timesheet.id).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw not found error', async () => {
      const id = 'random uuid';

      const update: ITimesheetUpdateInput = {
        id,
        client_location: 'Bhaktapur',
      };

      let error: any;

      try {
        const updated = await timesheetService.update(update);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.NotFoundError);
    });

    it('should update an existing task', async () => {
      const args: ITimesheetCreateInput = {
        total_hours: 10,
        total_expense: 100000,
        client_location: 'Lalitpur',
        approver_id: '3dc646b8-2cdc-4b20-b8bb-c8af70a62cdb',
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        company_id: 'b585d580-3e1b-4c07-8e51-9e38eddadf24',
        created_by: '26124a58-9167-45eb-a3b3-13163f263309',
      };

      const task = await timesheetService.create(args);

      const id = task.id;

      const update: ITimesheetUpdateInput = {
        id,
        client_location: 'Bhaktapur',
      };

      const updated = await timesheetService.update(update);

      expect(updated).toBeDefined();

      expect(updated.client_location).toBe(update.client_location);
    });
  });
});
