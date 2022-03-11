import { inject, injectable } from 'inversify';
import constants from '../config/constants';
import { LoginResponse } from '../entities/auth.entity';
import { IAuthService, ILoginInput } from '../interfaces/auth.interface';
import { IHashService, ITokenService } from '../interfaces/common.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { NotAuthenticatedError } from '../utils/api-error';

@injectable()
export default class AuthService implements IAuthService {
  private name = 'AuthService';
  private userRepository: IUserRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.TokenService) _tokenService: ITokenService
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
  }
  login = async (args: ILoginInput): Promise<LoginResponse | undefined> => {
    try {
      const email = args.email;
      const password = args.password;
      let user = await this.userRepository.getByEmail({ email: email });
      if (user) {
        const userPassword: any = user.password;

        let check = await this.hashService.compare(password, userPassword);
        if (check) {
          let payload = {
            id: user?.id,
          };
          let accessTokenData = {
            payload: payload,
            tokenSecret: constants.accessTokenSecret,
            tokenLife: constants.accessTokenLife,
          };
          let token = await this.tokenService.generateToken(accessTokenData);
          return {
            id: user.id,
            token: token,
          };
        } else {
          throw new NotAuthenticatedError({ details: ["Password doesn't match"] });
        }
      } else {
        throw new NotAuthenticatedError({ details: ["User doesn't exist"] });
      }
    } catch (err) {
      throw err;
    }
  };
}
