import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import User from '../entities/user.entity';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IUserCreate, IUserUpdate, IUserService } from '../interfaces/user.interface';

@injectable()
export default class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(@inject(TYPES.UserRepository) _userRepository: IUserRepository) {
    this.userRepository = _userRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<User>> => {
    try {
      const { rows, count } = await this.userRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IUserCreate): Promise<User> => {
    try {
      const email = args.email;
      const password = args.password;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const client_id = args.client_id;
      const address = args?.address;
      const roles = args.roles;

      const user = await this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
        roles,
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IUserUpdate): Promise<User> => {
    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const address = args?.address;
      const password = args?.password;

      const user = await this.userRepository.update({
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        password,
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<User> => {
    throw new Error('not implemented');
  };
}
