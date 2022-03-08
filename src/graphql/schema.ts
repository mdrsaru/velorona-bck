import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { ClientResolver } from './resolvers/client.resolver';
import { RoleResolver } from './resolvers/role.resolver';

export default buildSchema({
  resolvers: [ClientResolver, RoleResolver],
  container,
  validate: false,
});
