import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import constants from '../config/constants';
import { ForgotPasswordResponse, LoginResponse, ResetPasswordResponse } from '../entities/auth.entity';
import { NotAuthenticatedError } from '../utils/api-error';
import strings from '../config/strings';

import { IAuthService, IForgotPasswordInput, ILoginInput, IResetPasswordInput } from '../interfaces/auth.interface';
import { IEmailService, IHashService, ITokenService } from '../interfaces/common.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class AuthService implements IAuthService {
  private name = 'AuthService';
  private userRepository: IUserRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;
  private emailService: IEmailService;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.TokenService) _tokenService: ITokenService,
    @inject(TYPES.EmailService) _emailService: IEmailService
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
    this.emailService = _emailService;
  }
  login = async (args: ILoginInput): Promise<LoginResponse | undefined> => {
    try {
      const email = args.email;
      const password = args.password;
      let user = await this.userRepository.getByEmail({ email: email });

      if (!user) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
        });
      }

      const userPassword: any = user.password;

      let isPasswordCorrect = await this.hashService.compare(password, userPassword);
      if (!isPasswordCorrect) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
        });
      }

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
    } catch (err) {
      throw err;
    }
  };

  forgotPassword = async (args: IForgotPasswordInput): Promise<ForgotPasswordResponse> => {
    try {
      const email = args.email;
      const baseUrl = constants.frontendUrl + '/reset-password/?token=';
      let user = await this.userRepository.getByEmail({ email: email });
      if (user) {
        let payload = {
          id: user?.id,
        };
        let accessTokenData = {
          payload: payload,
          tokenSecret: constants.accessTokenSecret,
          tokenLife: constants.accessTokenLife,
        };
        let token = await this.tokenService.generateToken(accessTokenData);
        const mailSubject = constants.changePassword.changePasswordSubject;
        const mailBody = constants.changePassword.changePasswordBody;
        let emailData = {
          email: user.email,
          token: token,
          mailSubject,
          mailBody,
          baseUrl,
        };
        this.emailService.sendEmail(emailData);
        return {
          token: token,
        };
      } else {
        throw new NotAuthenticatedError({ details: ["User doesn't exist"] });
      }
    } catch (err) {
      throw err;
    }
  };

  resetPassword = async (args: IResetPasswordInput): Promise<ResetPasswordResponse> => {
    try {
      let token = await this.tokenService.extractToken(args.token);
      const password = args.password;
      const tokenData = {
        token: token,
        secretKey: constants.accessTokenSecret,
      };
      const result = await this.tokenService.verifyToken(tokenData);
      if (result) {
        const id = result.id;
        await this.userRepository.update({
          id,
          password: password,
        });
        return {
          message: 'Password changed sucessfully',
        };
      } else {
        throw new NotAuthenticatedError({ details: ['Invalid Token'] });
      }
    } catch (err) {
      throw err;
    }
  };
}
