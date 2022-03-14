import { injectable } from 'inversify';
import bcrypt from 'bcrypt';

import constants from '../config/constants';
import { IHashService } from '../interfaces/common.interface';

@injectable()
export default class BcryptService implements IHashService {
  async hash(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(Number(constants.saltRounds));
    return bcrypt.hash(password, salt);
  }

  compare(plainText: string, hash: any): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
