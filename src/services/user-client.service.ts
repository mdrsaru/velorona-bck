import { inject, injectable } from 'inversify';
import { Role, UserClientStatus } from '../config/constants';
import strings from '../config/strings';
import { IErrorService, ILogger } from '../interfaces/common.interface';
import { IUserClientCreate, IUserClientRepository, IUserClientService } from '../interfaces/user-client.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { NotAuthenticatedError, NotFoundError } from '../utils/api-error';

@injectable()
export default class UserClientService implements IUserClientService {
  private name = 'UserClientkService';
  private userClientRepository: IUserClientRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.userClientRepository = _userClientRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.userRepository = _userRepository;
  }

  associate = async (args: IUserClientCreate) => {
    const operation = 'create';

    const user_id = args.user_id;
    const client_id = args.client_id;

    try {
      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });
      const userRole = user?.roles.find((role) => role.name === Role.Employee);

      if (!userRole) {
        throw new NotFoundError({ details: [strings.userNotEmployee] });
      }
      let client = await this.userRepository.getById({
        id: client_id,
        relations: ['roles'],
      });

      const clientRole = client?.roles.find((e) => e.name === Role.Client);

      if (!clientRole) {
        throw new NotFoundError({ details: [strings.userNotClient] });
      }

      let activeUser = await this.userClientRepository.getAll({
        user_id: user_id,
        status: UserClientStatus.Active,
      });
      if (activeUser.length > 0) {
        throw new NotAuthenticatedError({ details: [strings.userStatusActive] });
      }
      let res = await this.userClientRepository.create({
        client_id,
        user_id,
      });
      return res;
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
