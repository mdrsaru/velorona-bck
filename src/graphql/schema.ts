import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { ClientResolver } from './resolvers/client.resolver';

export default buildSchema({
  resolvers: [ClientResolver],
  container,
  validate: false,
});
