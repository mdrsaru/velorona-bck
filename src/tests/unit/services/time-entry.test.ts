import ms from 'ms';
import container from '../../../inversify.config';

import * as apiError from '../../../utils/api-error';
import { TYPES } from '../../../types';
import { EntryType } from '../../../config/constants';
import { timeEntries } from '../../mock/data';
import TimeEntryRepository from '../../mock/time-entry.repository';
import TimesheetRepository from '../../mock/timesheet.repository';
import UserPayRateRepository from '../../mock/user-payrate.repository';
import ProjectRepository from '../../mock/project.repository';

import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryService,
  ITimeEntryUpdateInput,
} from '../../../interfaces/time-entry.interface';
import { IErrorService, ILogger } from '../../../interfaces/common.interface';
import { ITimesheetRepository } from '../../../interfaces/timesheet.interface';
import { IUserPayRateRepository } from '../../../interfaces/user-payrate.interface';
import { IProjectRepository } from '../../../interfaces/project.interface';

describe('TimeEntry Service', () => {
  let timeEntryService: ITimeEntryService;
  let errorService: IErrorService;
  let logger: ILogger;
  beforeAll(() => {
    container.rebind<ITimeEntryRepository>(TYPES.TimeEntryRepository).to(TimeEntryRepository);
    container.rebind<IUserPayRateRepository>(TYPES.UserPayRateRepository).to(UserPayRateRepository);
    container.rebind<ITimesheetRepository>(TYPES.TimesheetRepository).to(TimesheetRepository);
    container.rebind<IProjectRepository>(TYPES.ProjectRepository).to(ProjectRepository);
    timeEntryService = container.get<ITimeEntryService>(TYPES.TimeEntryService);
    errorService = container.get<IErrorService>(TYPES.ErrorService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined project service instance', () => {
      expect(timeEntryService).toBeDefined();
    });

    it('should return projects with pagination', async () => {
      const _timeEntries = await timeEntryService.getAllAndCount({});

      expect(_timeEntries).toBeDefined();
      expect(_timeEntries.data.length).toBe(timeEntries.length);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const args: ITimeEntryCreateInput = {
        startTime: new Date(),
        endTime: new Date(),
        clientLocation: 'Lalitpur',
        entryType: EntryType.Timesheet,
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        company_id: 'b585d580-3e1b-4c07-8e51-9e38eddadf24',
        created_by: '26124a58-9167-45eb-a3b3-13163f263309',
      };

      const timeEntry = await timeEntryService.create(args);

      expect(timeEntry).toBeDefined();

      expect(timeEntry.id).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw not found error', async () => {
      const id = 'random uuid';

      const update: ITimeEntryUpdateInput = {
        id,
        clientLocation: 'Bhaktapur',
      };

      let error: any;

      try {
        const updated = await timeEntryService.update(update);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.NotFoundError);
    });

    it('should update an existing task', async () => {
      const startTime = new Date('2022-05-12T01:02:00');
      const endTime = new Date('2022-05-12T01:03:00');

      const args: ITimeEntryCreateInput = {
        startTime,
        clientLocation: 'Lalitpur',
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        entryType: EntryType.Timesheet,
        company_id: 'b585d580-3e1b-4c07-8e51-9e38eddadf24',
        created_by: '26124a58-9167-45eb-a3b3-13163f263309',
      };

      const timeEntry = await timeEntryService.create(args);

      const id = timeEntry.id;

      const update: ITimeEntryUpdateInput = {
        id,
        clientLocation: 'Bhaktapur',
        endTime,
      };

      const updated = await timeEntryService.update(update);

      expect(updated).toBeDefined();
      expect(updated.clientLocation).toBe(update.clientLocation);
      expect(updated.duration).toBe(60);
    });
  });
});
