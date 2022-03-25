import find from 'lodash/find';

import {
  UserStatus,
  Role as RoleEnum,
  ClientStatus,
  InvitationStatus,
} from '../../config/constants';
import { IUser } from '../../interfaces/user.interface';
import { IClient } from '../../interfaces/client.interface';
import { IInvitation } from '../../interfaces/invitation.interface';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import Client from '../../entities/client.entity';
import Invitation from '../../entities/invitation.entity';

const role = new Role();
role.name = RoleEnum.SuperAdmin;
role.id = '050c4350-2e1f-49b6-a3f4-849cf7478612';

const employee = new Role();
employee.name = RoleEnum.Employee;
employee.id = 'aa993355-23a0-4e92-bbd4-89947531a130';

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
    client_id: null,
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

const _clients: IClient[] = [
  {
    id: 'ce351c02-3681-43df-9cdb-3a4f864dcb0b',
    name: 'Vellorum',
    clientCode: 'vellorum',
    status: ClientStatus.Active,
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

export let clients = _clients.map((client) => {
  const _client: any = new Client();
  _client.id = client.id;
  _client.name = client.name;
  _client.clientCode = client.clientCode;
  _client.status = client.status;
  _client.createdAt = client.createdAt;
  _client.updatedAt = client.updatedAt;
  return _client;
});

export let users = _users.map((user) => {
  const _user: any = new User();
  _user.id = user.id;
  _user.email = user.email;
  _user.firstName = user.firstName;
  _user.lastName = user.lastName;
  _user.status = user.status;
  _user.client_id = user.client_id ?? null;
  _user.createdAt = user.createdAt;
  _user.updatedAt = user.updatedAt;
  return _user;
});

const _invitations: IInvitation[] = [
  {
    id: '38e99c9b-83e1-40ab-b0d1-768b6ef5b28f',
    email: 'invited@user.com',
    client_id: clients[0]?.id,
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
  (invitation.client = find(_clients, { id: inv.client_id })),
    (invitation.inviter = find(_users, { id: inv.inviter_id })),
    (invitation.status = invitation.status);
  invitation.token = invitation.token;
  invitation.createdAt = invitation.createdAt;
  invitation.createdAt = invitation.createdAt;
  return invitation;
});
