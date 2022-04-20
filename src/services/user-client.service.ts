import { inject, injectable } from 'inversify';
import { IErrorService, ILogger } from '../interfaces/common.interface';
import { IUserClientCreate, IUserClientRepository, IUserClientService } from '../interfaces/user-client.interface';
import { TYPES } from '../types';

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
