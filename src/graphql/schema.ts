import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { AuthResolver } from './resolvers/auth.resolver';
import { CompanyResolver } from './resolvers/company.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { InvitationResolver } from './resolvers/invitation.resolver';
import { TaskResolver } from './resolvers/task.resolver';
import { ProjectResolver } from './resolvers/project.resolver';

export default buildSchema({
  container,
  validate: false,
  // prettier-ignore
  resolvers: [
    CompanyResolver,
    RoleResolver,
    UserResolver,
    AuthResolver,
    InvitationResolver,
    TaskResolver,
    ProjectResolver,
  ],
});
