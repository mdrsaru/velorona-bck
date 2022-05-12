import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import { projects, companies, users, userPayRates } from '../../mock/data';
import * as apiError from '../../../utils/api-error';
import {
  IUserPayRateCreateInput,
  IUserPayRateRepository,
  IUserPayRateService,
  IUserPayRateUpdateInput,
} from '../../../interfaces/user-payrate.interface';
import UserPayRateRepository from '../../mock/user-payrate.repository';
import { IErrorService, ILogger } from '../../../interfaces/common.interface';

describe('Project Service', () => {
  let userPayRateService: IUserPayRateService;
  let errorService: IErrorService;
  let logger: ILogger;

  beforeAll(() => {
    container.rebind<IUserPayRateRepository>(TYPES.UserPayRateRepository).to(UserPayRateRepository);
    userPayRateService = container.get<IUserPayRateService>(TYPES.UserPayRateService);
    errorService = container.get<IErrorService>(TYPES.ErrorService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined UserPayRate service instance', () => {
      expect(userPayRateService).toBeDefined();
    });

    it('should return userPayRates with pagination', async () => {
      const _userPayRates = await userPayRateService.getAllAndCount({});

      expect(_userPayRates).toBeDefined();
      expect(_userPayRates.data.length).toBe(userPayRates.length);
    });
  });

  describe('create', () => {
    it('should create a new user pay rate', async () => {
      const args: IUserPayRateCreateInput = {
        startDate: new Date(),
        endDate: new Date(),
        amount: 10000,
        user_id: users[0].id,
        project_id: projects[0].id,
      };

      const userPayRate = await userPayRateService.create(args);

      expect(userPayRate).toBeDefined();
      expect(userPayRate.id).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw not found error', async () => {
      const id = 'random uuid';
      const update: IUserPayRateUpdateInput = {
        id,
        amount: 20000,
      };

      let error: any;
      try {
        const updated = await userPayRateService.update(update);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.NotFoundError);
    });

    it('should update an existing project', async () => {
      const args: IUserPayRateCreateInput = {
        startDate: new Date(),
        endDate: new Date(),
        amount: 10000,
        user_id: users[0].id,
        project_id: projects[0].id,
      };

      const project = await userPayRateService.create(args);

      const id = project.id;

      const update: IUserPayRateUpdateInput = {
        id,
        amount: 2000000,
      };

      const updated = await userPayRateService.update(update);

      expect(updated).toBeDefined();
      expect(updated.amount).toBe(update.amount);
    });
  });
});
