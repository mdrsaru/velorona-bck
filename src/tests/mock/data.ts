import find from 'lodash/find';
import ms from 'ms';

import {
  UserStatus,
  Role as RoleEnum,
  CompanyStatus,
  ProjectStatus,
  TimeEntryApprovalStatus,
} from '../../config/constants';

import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import Company from '../../entities/company.entity';
import Project from '../../entities/project.entity';
import TimeEntry from '../../entities/time-entry.entity';
import UserPayRate from '../../entities/user-payrate.entity';
import Address from '../../entities/address.entity';

import { IUserPayRate } from '../../interfaces/user-payrate.interface';
import { IUser } from '../../interfaces/user.interface';
import { ICompany } from '../../interfaces/company.interface';
import { IProject } from '../../interfaces/project.interface';
import { ITimeEntry } from '../../interfaces/time-entry.interface';
import { IAddress } from '../../interfaces/address.interface';

const role = new Role();
role.name = RoleEnum.SuperAdmin;
role.id = '050c4350-2e1f-49b6-a3f4-849cf7478612';

const employee = new Role();
employee.name = RoleEnum.Employee;
employee.id = 'aa993355-23a0-4e92-bbd4-89947531a130';

const client = new Role();
client.name = RoleEnum.Client;
client.id = 'f0f3bb09-b597-4aca-82a6-d7bef629b69a';

const _users: IUser[] = [
  {
    id: '050c4350-2e1f-49b6-a3f4-849cf7478611',
    email: 'admin@admin.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    status: UserStatus.Active,
    phone: '98432871234',
    roles: [role],
    company_id: undefined,
    archived: false,
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
  {
    id: 'b97b91bd-03f1-450b-8b61-d8e033f8ac31',
    email: 'client@user.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    status: UserStatus.Active,
    phone: '98432871234',
    roles: [client],
    company_id: undefined,
    archived: false,
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

const _companies: ICompany[] = [
  {
    id: 'ce351c02-3681-43df-9cdb-3a4f864dcb0b',
    name: 'Vellorum',
    companyCode: 'vellorum',
    admin_email: 'company@admin.com',
    status: CompanyStatus.Active,
    archived: false,
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

export let companies = _companies.map((company) => {
  const _company: any = new Company();
  _company.id = company.id;
  _company.name = company.name;
  _company.companyCode = company.companyCode;
  _company.status = company.status;
  _company.archived = company.archived;
  _company.createdAt = company.createdAt;
  _company.updatedAt = company.updatedAt;
  return _company;
});

export let users = _users.map((user) => {
  const _user: any = new User();
  _user.id = user.id;
  _user.email = user.email;
  _user.firstName = user.firstName;
  _user.lastName = user.lastName;
  _user.status = user.status;
  _user.company_id = user.company_id ?? null;
  _user.archived = user.archived;
  _user.createdAt = user.createdAt;
  _user.updatedAt = user.updatedAt;
  return _user;
});

const _projects: IProject[] = [
  {
    id: 'aed11edc-4c05-4731-8676-72e105eea64d',
    name: 'Vellorum',
    client_id: 'b97b91bd-03f1-450b-8b61-d8e033f8ac31',
    status: ProjectStatus.Active,
    archived: false,
    company_id: 'ce351c02-3681-43df-9cdb-3a4f864dcb0b',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let projects = _projects.map((project) => {
  const _project: any = new Project();
  _project.id = project.id;
  _project.name = project.name;
  _project.client_id = project.client_id;
  _project.company_id = project.company_id;
  _project.createdAt = project.createdAt;
  _project.updatedAt = project.updatedAt;

  return _project;
});

const _timeEntries: ITimeEntry[] = [
  {
    id: 'aed11edc-4c05-4731-8676-72e105eea64d',
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    hourlyRate: 0,
    clientLocation: 'Lalitpur',
    approvalStatus: TimeEntryApprovalStatus.Pending,
    project_id: projects[0].id,
    project: projects[0],
    approver_id: users[0].id,
    approver: users[0],
    company_id: companies[0].id,
    company: companies[0],
    created_by: users[1].id,
    creator: users[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let timeEntries = _timeEntries.map((timeEntry) => {
  const _timeEntry: any = new TimeEntry();
  _timeEntry.id = timeEntry.id;
  _timeEntry.startTime = timeEntry.startTime;
  _timeEntry.endTime = timeEntry.endTime;
  _timeEntry.duration = timeEntry.duration;
  _timeEntry.clientLocation = timeEntry.clientLocation;
  _timeEntry.project_id = timeEntry.project_id;
  _timeEntry.approver_id = timeEntry.approver_id;
  _timeEntry.created_by = timeEntry.created_by;
  _timeEntry.company_id = timeEntry.company_id;
  _timeEntry.createdAt = timeEntry.createdAt;
  _timeEntry.updatedAt = timeEntry.updatedAt;

  return _timeEntry;
});

const _userPayRate: IUserPayRate[] = [
  {
    id: 'aed11edc-4c05-4731-8676-72e105eea64d',
    startDate: new Date(),
    endDate: new Date(),
    amount: 100000,
    user_id: 'b97b91bd-03f1-450b-8b61-d8e033f8ac31',
    project_id: 'ce351c02-3681-43df-9cdb-3a4f864dcb0b',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let userPayRates = _userPayRate.map((userPayRate) => {
  const _userPayRate: any = new UserPayRate();
  _userPayRate.id = userPayRate.id;
  _userPayRate.startDate = userPayRate.startDate;
  _userPayRate.endDate = userPayRate.endDate;
  _userPayRate.amount = userPayRate.amount;
  _userPayRate.user_id = userPayRate.user_id;
  _userPayRate.project_id = userPayRate.project_id;
  _userPayRate.createdAt = userPayRate.createdAt;
  _userPayRate.updatedAt = userPayRate.updatedAt;

  return _userPayRate;
});

const _address: IAddress[] = [
  {
    id: '3c696891-6aa6-4dec-a938-9531d67d887c',
    aptOrSuite: 'Suite',
    city: 'City',
    state: 'State',
    streetAddress: 'Street address',
    zipcode: '11111',
  },
];

export let address = _address.map((add) => {
  const __address = new Address();
  __address.id = add.id;
  __address.aptOrSuite = add.aptOrSuite;
  __address.city = add.city;
  __address.state = add.state;
  __address.streetAddress = add.streetAddress;
  __address.zipcode = add.zipcode;

  return __address;
});
