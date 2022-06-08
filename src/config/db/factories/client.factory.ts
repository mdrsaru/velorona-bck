import { define } from 'typeorm-seeding';

import Client from '../../../entities/client.entity';

define(Client, () => {
  const client = new Client();

  return client;
});
