import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import { Role as RoleEnum } from '../../../config/constants';

const roles = [
  {
    name: RoleEnum.SuperAdmin,
    description: 'Super admin',
  },
  {
    name: RoleEnum.ClientAdmin,
    description: 'Client admin',
  },
  {
    name: RoleEnum.Employee,
    description: 'Employee',
  },
  {
    name: RoleEnum.TaskManager,
    description: 'Task Manager',
  },
  {
    name: RoleEnum.Vendor,
    description: 'Vendor',
  },
];

const users = [
  {
    email: 'admin@admin.com',
  },
  {
    email: 'client@admin.com',
  },
  {
    email: 'employee@user.com',
  },
  {
    email: 'manager@user.com',
  },
  {
    email: 'vendor@user.com',
  },
];

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    let createdRoles: any = [];

    for (let role of roles) {
      const createdRole = await factory(Role)().create({
        ...role,
      });

      createdRoles.push(createdRole);
    }

    for (let [index, user] of users.entries()) {
      await factory(User)().create({
        roles: [createdRoles[index]],
        email: user.email,
      });
    }
  }
}
