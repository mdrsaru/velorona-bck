import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import BaseRepository from './base.repository';

import { IUserRecordRepository } from '../interfaces/user-record.interface';
import UserRecord from '../entities/user-record.entity';
@injectable()
export default class UserRecordRepository
  extends BaseRepository<UserRecord>
  implements IUserRecordRepository
{
  constructor() {
    super(getRepository(UserRecord));
  }
}
