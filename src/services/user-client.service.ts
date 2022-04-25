import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import User from '../entities/user.entity';

import { IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IUserClientCreate,
  IUserClientRepository,
  IUserClientService,
  IUserClientMakeInactive,
} from '../interfaces/user-client.interface';

@injectable()
export default class UserClientService implements IUserClientService {
  private name = 'UserClientkService';
  private userClientRepository: IUserClientRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository
  ) {
    this.userClientRepository = _userClientRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  associate = async (args: IUserClientCreate) => {
    const operation = 'create';

    const user_id = args.user_id;
    const client_id = args.client_id;

    try {
      const userClient = await this.userClientRepository.create({
        client_id,
        user_id,
      });

      return userClient;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  changeStatusToInactive = async (args: IUserClientMakeInactive): Promise<User> => {
    const operation = 'changeStatusToInactive';

    const user_id = args.user_id;

    try {
      const userClient = await this.userClientRepository.changeStatusToInactive({
        user_id,
      });

      return userClient;
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
