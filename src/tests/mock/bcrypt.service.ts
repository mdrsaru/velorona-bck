import { injectable } from 'inversify';
import bcrypt from 'bcrypt';

import { IHashService } from '../../interfaces/common.interface';

@injectable()
export default class BcryptServiceMock implements IHashService {
  hash(password: string, salt?: string): Promise<string> {
    return Promise.resolve(password);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    if (plainText === hash) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
