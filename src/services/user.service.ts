import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import { Role as RoleEnum } from '../config/constants';
import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import { generateRandomStrings } from '../utils/strings';
import constants, { emailSetting, events } from '../config/constants';
import userEmitter from '../subscribers/user.subscriber';
import companyEmitter from '../subscribers/company.subscriber';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID, ITemplateService, IEmailService, ILogger } from '../interfaces/common.interface';
import { IChangeProfilePictureInput, IUserArchiveOrUnArchive, IUserRepository } from '../interfaces/user.interface';
import { IUserCreate, IUserUpdate, IUserService } from '../interfaces/user.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

@injectable()
export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private handlebarsService: ITemplateService;
  private emailService: IEmailService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.userRepository = _userRepository;
    this.companyRepository = _companyRepository;
    this.handlebarsService = _handlebarsService;
    this.emailService = _emailService;
    this.logger = loggerFactory('UserService');
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<User>> => {
    try {
      const { rows, count } = await this.userRepository.getAllAndCount(args);

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

  create = async (args: IUserCreate): Promise<User> => {
    const operation = 'create';

    try {
      const email = args.email;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const company_id = args.company_id;
      const address = args?.address;
      const roles = args.roles;
      const type = args?.type;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const password = generateRandomStrings({ length: 8 });

      const user = await this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        company_id,
        address,
        roles,
        type,
        startDate,
        endDate,
        timesheet_attachment,
      });

      // Emit event for onUserCreate
      userEmitter.emit(events.onUserCreate, {
        company_id,
        user: user,
        password,
      });

      // Emit event for updateCompanySubscriptionUsage
      if (user.company_id && roles.includes(RoleEnum.Employee)) {
        companyEmitter.emit(events.updateCompanySubscriptionUsage, {
          company_id: user.company_id,
        });
      }

      return user;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IUserUpdate): Promise<User> => {
    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const address = args?.address;
      const password = args?.password;
      const type = args?.type;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;

      const user = await this.userRepository.update({
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        password,
        type,
        startDate,
        endDate,
        timesheet_attachment,
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  userArchiveOrUnArchive = async (args: IUserArchiveOrUnArchive): Promise<User> => {
    try {
      const id = args.id;
      const archived = args?.archived;

      const user = await this.userRepository.update({
        id,
        archived,
      });

      // Emit event for updateCompanySubscriptionUsage
      if (user.company_id) {
        companyEmitter.emit(events.updateCompanySubscriptionUsage, {
          company_id: user.company_id,
        });
      }

      return user;
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<User> => {
    throw new Error('not implemented');
  };

  getById = async (args: IEntityID): Promise<User | undefined> => {
    try {
      const id = args.id;
      return await this.userRepository.getById({ id });
    } catch (err) {
      throw err;
    }
  };

  changeProfilePicture = async (args: IChangeProfilePictureInput): Promise<User> => {
    try {
      const id = args.id;
      const avatar_id = args.avatar_id;
      return await this.userRepository.update({
        id,
        avatar_id,
      });
    } catch (err) {
      throw err;
    }
  };
}
