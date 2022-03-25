import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { AuthResolver } from './resolvers/auth.resolver';
import { ClientResolver } from './resolvers/client.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { InvitationResolver } from './resolvers/invitation.resolver';

export default buildSchema({
  resolvers: [
    ClientResolver,
    RoleResolver,
    UserResolver,
    AuthResolver,
    InvitationResolver,
  ],
  container,
  validate: false,
});
