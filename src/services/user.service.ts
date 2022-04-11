import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import { generateRandomStrings } from '../utils/strings';
import constants, { emailSetting } from '../config/constants';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID, ITemplateService, IEmailService, ILogger } from '../interfaces/common.interface';
import { IChangeProfilePictureInput, IUserArchive, IUserRepository } from '../interfaces/user.interface';
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
      args.query.archived = false;
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

  searchClient = async (args: IPagingArgs): Promise<IPaginationData<User>> => {
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
      const record = args?.record;
      const password = generateRandomStrings({ length: 8 });
      const client_id = args?.client_id;

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
        record,
        client_id,
      });

      let emailBody: string = emailSetting.newUser.adminBody;
      let company: Company | undefined;
      if (company_id) {
        emailBody = emailSetting.newUser.companyBody;
        company = await this.companyRepository.getById({
          id: company_id,
        });
      }

      const userHtml = this.handlebarsService.compile({
        template: emailBody,
        data: {
          companyCode: company?.companyCode ?? '',
          password,
        },
      });

      // send email asynchronously
      this.emailService
        .sendEmail({
          to: user.email,
          from: emailSetting.fromEmail,
          subject: emailSetting.newUser.subject,
          html: userHtml,
        })
        .then((response) => {
          this.logger.info({
            operation,
            message: `Email response for ${user.email}`,
            data: response,
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: 'Error sending user create email',
            data: err,
          });
        });

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
      const record = args?.record;
      const archived = args?.archived;

      const user = await this.userRepository.update({
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        password,
        record,
        archived,
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  userArchive = async (args: IUserArchive): Promise<User> => {
    try {
      const id = args.id;
      const archived = args?.archived;

      const user = await this.userRepository.update({
        id,
        archived,
      });

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
