import { define } from 'typeorm-seeding';

import Address from '../../../entities/address.entity';

define(Address, () => {
  const address = new Address();

  return address;
});
