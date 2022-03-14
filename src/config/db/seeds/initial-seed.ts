import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import { Role as RoleEnum } from '../../../config/constants';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
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

    let createdRoles: any = [];

    roles.forEach(async (role) => {
      const createdRole = await factory(Role)().create({
        ...role,
      });

      createdRoles.push(createdRole);
    });

    await factory(User)()
      .map(async (user) => {
        user.roles = [createdRoles[0]];
        return user;
      })
      .create({
        email: 'admin@admin.com',
      });
  }
}
