//import * as Faker from "faker";
import { define } from 'typeorm-seeding';

import Role from '../../../entities/role.entity';
import { Role as RoleEnum } from '../../../config/constants';

define(Role, () => {
  const role = new Role();

  return role;
});
