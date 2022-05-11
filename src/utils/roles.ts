import Role from '../entities/role.entity';
import { Role as RoleEnum } from '../config/constants';

export interface ICheckRoleArgs {
  expectedRoles: string[];
  userRoles: Role[];
}

export interface ICheckAdmin {
  roles: Role[];
}

/**
 * Checks the expected roles with the user roles
 */
export const checkRoles = (args: ICheckRoleArgs) => {
  const expectedRoles = args.expectedRoles;
  const userRoles: string[] = args.userRoles.map((role) => role.name);

  return expectedRoles.some((role) => userRoles.includes(role));
};

export const isSuperAdmin = (args: ICheckAdmin) => {
  const superAdmin = args.roles.find((role) => role.name === RoleEnum.SuperAdmin);
  return !!superAdmin;
};

export const isCompanyAdmin = (args: ICheckAdmin) => {
  const companyAdmin = args.roles.find((role) => role.name === RoleEnum.CompanyAdmin);
  return !!companyAdmin;
};
