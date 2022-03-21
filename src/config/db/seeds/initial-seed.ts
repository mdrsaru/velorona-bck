import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import Client from '../../../entities/client.entity';
import { Role as RoleEnum, ClientStatus } from '../../../config/constants';

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

const clients = [
  {
    name: 'Vellorum',
    status: ClientStatus.Active,
    clientCode: 'vellorum',
  },
];

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    let createdRoles: any = [];
    let createdClients: Client[] = [];

    for (let role of roles) {
      const createdRole = await factory(Role)().create({
        ...role,
      });

      createdRoles.push(createdRole);
    }

    for (let client of clients) {
      const newClient = await factory(Client)().create(client);

      createdClients.push(newClient);
    }

    // admin
    await factory(User)().create({
      roles: [createdRoles[0]],
      email: users[0].email,
    });

    //clients
    for (let i = 1; i < users.length; i++) {
      await factory(User)().create({
        roles: [createdRoles[i]],
        email: users[i].email,
        client_id: createdClients[0]?.id,
      });
    }
  }
}
