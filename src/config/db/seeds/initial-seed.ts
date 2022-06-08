import find from 'lodash/find';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import constants from '../../constants';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import Company from '../../../entities/company.entity';
import Address from '../../../entities/address.entity';
import Client from '../../../entities/client.entity';
import UserClient from '../../../entities/user-client.entity';
import { Role as RoleEnum, CompanyStatus, ClientStatus, UserClientStatus } from '../../../config/constants';

const roles = [
  {
    name: RoleEnum.SuperAdmin,
    description: 'Super admin',
  },
  {
    name: RoleEnum.CompanyAdmin,
    description: 'Company admin',
  },
  {
    name: RoleEnum.Employee,
    description: 'Employee',
  },
  {
    name: RoleEnum.TaskManager,
    description: 'Task Manager',
  },
];

let users = [
  {
    email: 'admin@admin.com',
  },
  {
    email: 'company@admin.com',
  },
  {
    email: 'employee@user.com',
  },
  {
    email: 'manager@user.com',
  },
];

if (constants.env === 'production') {
  users = [
    {
      email: 'admin@admin.com',
    },
  ];
}

const companies = [
  {
    name: 'Vellorum',
    status: CompanyStatus.Active,
    companyCode: 'vellorum',
    adminEmail: 'company@admin.com',
  },
];

const clients = [
  {
    name: 'Spark',
    email: 'spark@yopmail.com',
    invoicingEmail: 'spark@yopmail.com',
    archived: false,
    status: ClientStatus.Active,
  },
];

const address = {
  streetAddress: '101 Museum',
  aptOrSuite: '',
  city: 'Austin',
  state: 'Texas',
  zipCode: '75001',
};

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    let createdRoles: any = [];

    for (let role of roles) {
      const createdRole = await factory(Role)().create({
        ...role,
      });

      createdRoles.push(createdRole);
    }

    // admin
    let u = await factory(User)().create({
      roles: [createdRoles[0]],
      email: users[0].email,
    });

    //company users
    if (constants.env !== 'production') {
      let createdCompanies: Company[] = [];
      let createdClients: Client[] = [];

      for (let company of companies) {
        const newCompany = await factory(Company)().create(company);

        createdCompanies.push(newCompany);
      }

      const createdAddress = await factory(Address)().create(address);

      for (let i = 0; i < clients.length; i++) {
        const newClient = await factory(Client)().create({
          ...clients[i],
          address: createdAddress,
          company_id: createdCompanies[0].id,
        });

        createdClients.push(newClient);
      }

      for (let i = 1; i < users.length; i++) {
        const newUser = await factory(User)().create({
          roles: [createdRoles[i]],
          email: users[i].email,
          company_id: createdCompanies[0]?.id,
        });

        // Associate client only for employee
        if (find(newUser?.roles ?? [], { name: 'Employee' })) {
          await factory(UserClient)().create({
            status: UserClientStatus.Active,
            user_id: newUser.id,
            client_id: createdClients[0].id,
          });
        }
      }
    }
  }
}
