import find from 'lodash/find';
import ms from 'ms';

import { UserStatus, Role as RoleEnum, CompanyStatus, InvitationStatus } from '../../config/constants';
import { IUser } from '../../interfaces/user.interface';
import { ICompany } from '../../interfaces/company.interface';
import { IInvitation } from '../../interfaces/invitation.interface';
import { IProject } from '../../interfaces/project.interface';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import Company from '../../entities/company.entity';
import Invitation from '../../entities/invitation.entity';
import Project from '../../entities/project.entity';
import { ITimesheet } from '../../interfaces/timesheet.interface';
import Timesheet from '../../entities/timesheet.entity';

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

const _invitations: IInvitation[] = [
  {
    id: '38e99c9b-83e1-40ab-b0d1-768b6ef5b28f',
    email: 'invited@user.com',
    role: RoleEnum.Employee,
    expiresIn: new Date(Date() + ms('50m')),
    company_id: companies[0]?.id,
    inviter_id: users[0]?.id,
    status: InvitationStatus.Pending,
    token: 'token',
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

export let invitations = _invitations.map((inv) => {
  const invitation: any = new Invitation();
  invitation.id = inv.id;
  invitation.email = inv.email;
  invitation.company = find(_companies, { id: inv.company_id });
  invitation.inviter = find(_users, { id: inv.inviter_id });
  invitation.status = invitation.status;
  invitation.token = invitation.token;
  invitation.role = invitation.role;
  invitation.expiresIn = invitation.expiresIn;
  invitation.createdAt = invitation.createdAt;

  return invitation;
});

const _projects: IProject[] = [
  {
    id: 'aed11edc-4c05-4731-8676-72e105eea64d',
    name: 'Vellorum',
    client_id: 'b97b91bd-03f1-450b-8b61-d8e033f8ac31',
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

const _timesheets: ITimesheet[] = [
  {
    id: 'aed11edc-4c05-4731-8676-72e105eea64d',
    start: new Date(),
    end: new Date(),
    clientLocation: 'Lalitpur',
    task_id: '12566ff8-1247-4a2a-a258-09b05268e2ce',
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

export let timesheets = _timesheets.map((timesheet) => {
  const _timesheet: any = new Timesheet();
  _timesheet.id = timesheet.id;
  _timesheet.clientLocation = timesheet.clientLocation;
  _timesheet.project_id = timesheet.project_id;
  _timesheet.approver_id = timesheet.approver_id;
  _timesheet.created_by = timesheet.created_by;
  _timesheet.company_id = timesheet.company_id;
  _timesheet.createdAt = timesheet.createdAt;
  _timesheet.updatedAt = timesheet.updatedAt;

  return _timesheet;
});
