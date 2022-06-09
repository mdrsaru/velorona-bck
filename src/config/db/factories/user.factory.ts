import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';

import { UserStatus } from '../../../config/constants';

import User from '../../../entities/user.entity';
import Address from '../../../entities/address.entity';

define(User, () => {
  const user = new User();
  user.firstName = faker.name.firstName();
  user.lastName = faker.name.lastName();
  user.password = '$2b$10$AnL7k/hZPi9bWxwNFfhymezyF2ZGhszYBVd66vfJs4gPmsY37U.Ha';
  user.status = UserStatus.Active;
  user.phone = '1234567891';

  const address = new Address();
  address.streetAddress = faker.address.streetAddress();
  address.aptOrSuite = faker.address.secondaryAddress();
  address.city = faker.address.city();
  address.state = faker.address.state();
  address.zipcode = faker.address.zipCode();

  user.address = address;

  return user;
});
