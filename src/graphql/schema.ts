import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { ClientResolver } from './resolvers/client.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';

export default buildSchema({
  resolvers: [ClientResolver, RoleResolver, UserResolver],
  container,
  validate: false,
});
