import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import { users } from '../../mock/data';
import strings from '../../../config/strings';
import * as apiError from '../../../utils/api-error';
import { UserStatus } from '../../../config/constants';
import UserService from '../../../services/user.service';
import UserRepository from '../../mock/user.repository';
import CompanyRepository from '../../mock/company.repository';
import SendGridService from '../../mock/sendgrid.service';

import { IUserRepository, IUserService, IUserCreate, IUserUpdate } from '../../../interfaces/user.interface';
import { ICompanyRepository } from '../../../interfaces/company.interface';
import { IEmailService } from '../../../interfaces/common.interface';

describe('User Service', () => {
  let userService: IUserService;
  beforeAll(() => {
    container.rebind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
    container.rebind<IEmailService>(TYPES.EmailService).to(SendGridService);
    container.rebind<ICompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository);
    userService = container.get<UserService>(TYPES.UserService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined user service instance', () => {
      expect(userService).toBeDefined();
    });

    it('should return users with pagination', async () => {
      const _users = await userService.getAllAndCount({});

      expect(_users).toBeDefined();
      expect(_users.data.length).toBe(users.length);
    });
  });

  describe('create', () => {
    it('should throw Conflict validation if the user already exists', async () => {
      const args: IUserCreate = {
        firstName: 'User',
        lastName: 'Name',
        email: 'admin@admin.com',
        phone: '9841273487',
        status: UserStatus.Active,
        roles: ['1', '2'],
      };

      let error: any;
      try {
        const user = await userService.create(args);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.ConflictError);
      expect(error.details).toContain(strings.userAlreadyExists);
    });

    it('should create a new user', async () => {
      const args: IUserCreate = {
        firstName: 'User',
        lastName: 'Name',
        email: 'test1@test.com',
        status: UserStatus.Active,
        phone: '9841273487',
        roles: ['1,', '2'],
        address: {
          streetAddress: 'Street',
          aptOrSuite: 'Apt',
          city: 'City',
          state: 'State',
          zipcode: '001122',
        },
      };

      const user = await userService.create(args);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.address).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw not found error', async () => {
      const id = 'random uuid';
      const update: IUserUpdate = {
        id,
        firstName: 'first',
        lastName: 'last',
      };

      let error: any;
      try {
        const updated = await userService.update(update);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.NotFoundError);
    });

    it('should update an existing user', async () => {
      const args: IUserCreate = {
        firstName: 'User',
        lastName: 'Name',
        email: 'test2@test.com',
        status: UserStatus.Active,
        phone: '98412783748',
        roles: ['1', '2'],
      };

      const user = await userService.create(args);

      const id = user.id;

      const update: IUserUpdate = {
        id,
        firstName: 'Updated User',
        lastName: 'Updated Last name',
        status: UserStatus.Inactive,
      };

      const updated = await userService.update(update);

      expect(updated).toBeDefined();
      expect(updated.firstName).toBe(update.firstName);
      expect(updated.lastName).toBe(update.lastName);
      expect(updated.status).toBe(update.status);
    });
  });
});
