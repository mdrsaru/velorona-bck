import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import { Role as RoleEnum, UserStatus } from '../config/constants';
import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import { generateRandomStrings } from '../utils/strings';
import constants, { emailSetting, events } from '../config/constants';
import userEmitter from '../subscribers/user.subscriber';
import companyEmitter from '../subscribers/company.subscriber';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID, ITemplateService, IEmailService, ILogger } from '../interfaces/common.interface';
import {
  IChangeProfilePictureInput,
  IUserArchiveOrUnArchive,
  IUserRepository,
  IUserAttachProject,
} from '../interfaces/user.interface';
import { IUserCreate, IUserUpdate, IUserService } from '../interfaces/user.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import Role from '../entities/role.entity';

@injectable()
export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  private handlebarsService: ITemplateService;
  private emailService: IEmailService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.userRepository = _userRepository;
    this.companyRepository = _companyRepository;
    this.projectRepository = _projectRepository;
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
      const entryType = args?.entryType;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const manager_id = args.manager_id;
      const password = generateRandomStrings({ length: 8 });
      const designation = args.designation;

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
        entryType,
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
        designation,
      });

      // Emit event for onUserCreate
      userEmitter.emit(events.onUserCreate, {
        company_id,
        user: user,
        password,
      });

      if (roles.includes(RoleEnum.TaskManager)) {
        // Emit event for onApproverAdded
        userEmitter.emit(events.onApproverAdded, {
          user,
        });
      }

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
      const entryType = args?.entryType;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const manager_id = args?.manager_id;
      const roles = args?.roles;
      const designation = args.designation;
      const email = args?.email;

      const user = await this.userRepository.update({
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        password,
        entryType,
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
        roles,
        designation,
        email,
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
      let status: UserStatus | undefined;

      const update: IUserUpdate = {
        id,
        archived,
      };

      if (archived) {
        update.status = UserStatus.Inactive;
      } else if (archived === false) {
        update.status = UserStatus.Active;
      }

      const user = await this.userRepository.update(update);

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

  attachProject = async (args: IUserAttachProject): Promise<User | undefined> => {
    try {
      const user_id = args.user_id;
      const project_ids = args.project_ids;
      const user = await this.userRepository.getById({ id: user_id?.[0] });
      project_ids.map(async (project_id, index) => {
        await this.projectRepository.assignProjectToUsers({
          user_id,
          project_id,
        });
      });

      return user;
    } catch (err) {
      throw err;
    }
  };
}
