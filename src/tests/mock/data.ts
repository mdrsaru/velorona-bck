import { UserStatus } from '../../config/constants';
import { IUser } from '../../interfaces/user.interface';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';

const role = new Role();
role.name = 'SuperAdmin';
role.id = '050c4350-2e1f-49b6-a3f4-849cf7478612';

const _users: IUser[] = [
  {
    id: '050c4350-2e1f-49b6-a3f4-849cf7478611',
    email: 'test@test.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    status: UserStatus.Active,
    phone: '98432871234',
    roles: [role],
    createdAt: '2022-03-08T08:01:04.776Z',
    updatedAt: '2022-03-08T08:01:04.776Z',
  },
];

export let users = _users.map((user) => {
  const _user: { [key: string]: any } = new User();
  _user.id = user.id;
  _user.email = user.email;
  _user.firstName = user.firstName;
  _user.lastName = user.lastName;
  _user.status = user.status;
  _user.createdAt = user.createdAt;
  _user.updatedAt = user.updatedAt;
  return _user;
});
