import { ContainerModule, interfaces } from 'inversify';

import { IAddressRepository } from '../../interfaces/address.interface';
import { IUserRecordRepository } from '../../interfaces/user-record.interface';
import AddressRepository from '../../repository/address.repository';
import UserRecordRepository from '../../repository/user-record.repository';
import { TYPES } from '../../types';

const userRecord = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IUserRecordRepository>(TYPES.UserRecordRepository).to(
      UserRecordRepository
    );
  }
);

export default userRecord;
