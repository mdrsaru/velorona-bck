import Role from '../entities/role.entity';
import { Role as RoleEnum } from '../config/constants';

export interface ICheckRoleArgs {
  expectedRoles: string[];
  userRoles: Role[];
}

export interface ICheckAdmin {
  roles: Role[];
}

export const checkRoles = (args: ICheckRoleArgs) => {
  const expectedRoles = args.expectedRoles;
  const userRoles: string[] = args.userRoles.map((role) => role.name);

  return expectedRoles.some((role) => userRoles.includes(role));
};

export const isSuperAdmin = (args: ICheckAdmin) => {
  const superAdmin = args.roles.find(
    (role) => role.name === RoleEnum.SuperAdmin
  );
  return !!superAdmin;
};
