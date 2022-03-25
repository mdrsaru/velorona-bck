import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import User from '../entities/user.entity';
import Client from '../entities/client.entity';
import { generateRandomStrings } from '../utils/strings';
import constants, { emailSetting } from '../config/constants';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import {
  IEntityRemove,
  IEntityID,
  ITemplateService,
  IEmailService,
  ILogger,
} from '../interfaces/common.interface';
import {
  IChangeProfilePictureInput,
  IUserRepository,
} from '../interfaces/user.interface';
import {
  IUserCreate,
  IUserUpdate,
  IUserService,
} from '../interfaces/user.interface';
import { IClientRepository } from '../interfaces/client.interface';

@injectable()
export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private handlebarsService: ITemplateService;
  private emailService: IEmailService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.userRepository = _userRepository;
    this.clientRepository = _clientRepository;
    this.handlebarsService = _handlebarsService;
    this.emailService = _emailService;
    this.logger = loggerFactory('UserService');
  }

  getAllAndCount = async (
    args: IPagingArgs
  ): Promise<IPaginationData<User>> => {
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
      const client_id = args.client_id;
      const address = args?.address;
      const roles = args.roles;
      const record = args?.record;
      const password = generateRandomStrings({ length: 8 });

      const user = await this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
        roles,
        record,
      });

      let emailBody: string = emailSetting.newUser.adminBody;
      let client: Client | undefined;
      if (client_id) {
        emailBody = emailSetting.newUser.clientBody;
        client = await this.clientRepository.getById({
          id: client_id,
        });
      }

      console.log(emailBody, 'body');
      const userHtml = this.handlebarsService.compile({
        template: emailBody,
        data: {
          clientCode: client?.clientCode ?? '',
          password,
        },
      });
      console.log({
        to: user.email,
        from: emailSetting.fromEmail,
        subject: emailSetting.newUser.subject,
        html: userHtml,
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
  changeProfilePicture = async (
    args: IChangeProfilePictureInput
  ): Promise<User> => {
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
