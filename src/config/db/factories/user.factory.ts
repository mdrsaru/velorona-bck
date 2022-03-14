import { define } from 'typeorm-seeding';

import { UserStatus } from '../../../config/constants';

import User from '../../../entities/user.entity';
import Address from '../../../entities/address.entity';

define(User, () => {
  const user = new User();
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.password = '$2b$10$AnL7k/hZPi9bWxwNFfhymezyF2ZGhszYBVd66vfJs4gPmsY37U.Ha';
  user.status = UserStatus.Active;
  user.phone = '1234567891';

  const address = new Address();
  address.streetAddress = 'Street address';

  user.address = address;

  return user;
});
