import { injectable } from 'inversify';

import { IAppService } from '../interfaces/common.interface';

@injectable()
export default class AppService implements IAppService {
  getStatus = () => 'OK';
}
