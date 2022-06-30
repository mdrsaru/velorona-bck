import find from 'lodash/find';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';

import constants, { UserType } from '../../constants';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import Company from '../../../entities/company.entity';
import Address from '../../../entities/address.entity';
import Client from '../../../entities/client.entity';
import Project from '../../../entities/project.entity';
import Task from '../../../entities/task.entity';
import UserClient from '../../../entities/user-client.entity';
import {
  Role as RoleEnum,
  CompanyStatus,
  ClientStatus,
  UserClientStatus,
  ProjectStatus,
  TaskStatus,
} from '../../../config/constants';

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

const projects: any = [];
for (let i = 0; i < 10; i++) {
  const project = {
    name: faker.company.companyName(),
    status: ProjectStatus.Active,
  };
  projects.push(project);
}

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
      const company_id = createdCompanies[0].id;

      const createdAddress = await factory(Address)().create(address);

      for (let i = 0; i < clients.length; i++) {
        const newClient = await factory(Client)().create({
          ...clients[i],
          address: createdAddress,
          company_id: createdCompanies[0].id,
        });

        createdClients.push(newClient);
      }

      const client_id = createdClients[0].id;
      const createdUsers: User[] = [];
      let employee: User | undefined = undefined;
      let manager: User | undefined = undefined;

      for (let i = 1; i < users.length; i++) {
        const _user: { [key: string]: any } = {
          roles: [createdRoles[i]],
          email: users[i].email,
          company_id,
        };

        if (users[i].email === 'employee@user.com') {
          _user.type = UserType.Timesheet;
        }

        const newUser = await factory(User)().create(_user);

        createdUsers.push(newUser);

        if (find(newUser?.roles ?? [], { name: 'TaskManager' })) {
          manager = newUser;
        } else if (find(newUser?.roles ?? [], { name: 'Employee' })) {
          // Associate client only for employee
          employee = newUser;
          await factory(UserClient)().create({
            status: UserClientStatus.Active,
            user_id: newUser.id,
            client_id,
          });
        }
      }

      for (let i = 0; i < projects.length; i++) {
        const newProject = await factory(Project)().create({
          ...projects[i],
          company_id,
          client_id,
        });

        for (let j = i; j < i + 4; j++) {
          await factory(Task)().create({
            name: faker.company.catchPhrase(),
            description: faker.git.commitMessage(),
            status: TaskStatus.Scheduled,
            company_id,
            manager_id: manager?.id,
            project_id: newProject.id,
            users: employee ? [employee] : [],
          });
        }
      }
    }
  }
}
