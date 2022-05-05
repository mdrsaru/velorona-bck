import { IErrorService, ILogger } from '../../../interfaces/common.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryService,
  ITimeEntryUpdateInput,
} from '../../../interfaces/time-entry.interface';
import container from '../../../inversify.config';
import * as apiError from '../../../utils/api-error';
import { TYPES } from '../../../types';
import { timeEntries } from '../../mock/data';
import TimeEntryRepository from '../../mock//time-entry.repository';

describe('TimeEntry Service', () => {
  let timeEntryService: ITimeEntryService;
  let errorService: IErrorService;
  let logger: ILogger;
  beforeAll(() => {
    container.rebind<ITimeEntryRepository>(TYPES.TimeEntryRepository).to(TimeEntryRepository);
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
        start: new Date(),
        end: new Date(),
        clientLocation: 'Lalitpur',
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        task_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
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
      const args: ITimeEntryCreateInput = {
        start: new Date(),
        end: new Date(),
        clientLocation: 'Lalitpur',
        project_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        task_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
        company_id: 'b585d580-3e1b-4c07-8e51-9e38eddadf24',
        created_by: '26124a58-9167-45eb-a3b3-13163f263309',
      };

      const task = await timeEntryService.create(args);

      const id = task.id;

      const update: ITimeEntryUpdateInput = {
        id,
        clientLocation: 'Bhaktapur',
      };

      const updated = await timeEntryService.update(update);

      expect(updated).toBeDefined();

      expect(updated.clientLocation).toBe(update.clientLocation);
    });
  });
});
