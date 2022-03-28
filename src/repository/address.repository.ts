import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import BaseRepository from './base.repository';

import Address from '../entities/address.entity';
import { IAddressRepository } from '../interfaces/address.interface';
@injectable()
export default class AddressRepository
  extends BaseRepository<Address>
  implements IAddressRepository
{
  constructor() {
    super(getRepository(Address));
  }
}
