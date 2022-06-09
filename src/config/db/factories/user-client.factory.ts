import { define } from 'typeorm-seeding';

import UserClient from '../../../entities/user-client.entity';

define(UserClient, () => {
  const userClient = new UserClient();

  return userClient;
});
