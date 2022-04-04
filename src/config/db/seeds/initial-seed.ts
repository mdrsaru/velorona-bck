import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import User from '../../../entities/user.entity';
import Role from '../../../entities/role.entity';
import Company from '../../../entities/company.entity';
import { Role as RoleEnum, CompanyStatus } from '../../../config/constants';

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
  {
    name: RoleEnum.Client,
    description: 'Client',
  },
];

const users = [
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
  {
    email: 'client@user.com',
  },
];

const companys = [
  {
    name: 'Vellorum',
    status: CompanyStatus.Active,
    companyCode: 'vellorum',
  },
];

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    let createdRoles: any = [];
    let createdCompanys: Company[] = [];

    for (let role of roles) {
      const createdRole = await factory(Role)().create({
        ...role,
      });

      createdRoles.push(createdRole);
    }

    for (let company of companys) {
      const newCompany = await factory(Company)().create(company);

      createdCompanys.push(newCompany);
    }

    // admin
    await factory(User)().create({
      roles: [createdRoles[0]],
      email: users[0].email,
    });

    //companys
    for (let i = 1; i < users.length; i++) {
      await factory(User)().create({
        roles: [createdRoles[i]],
        email: users[i].email,
        company_id: createdCompanys[0]?.id,
      });
    }
  }
}
