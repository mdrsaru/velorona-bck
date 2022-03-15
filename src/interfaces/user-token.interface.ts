import UserToken from '../entities/user-token.entity';
import { TokenType } from '../config/constants';

export interface IUserToken {
  token: string;
  expiresIn: Date;
  tokenType: TokenType;
  user_id: string;
}

export interface IUserTokenCreateRepo {
  token: string;
  expiresIn: Date;
  tokenType: IUserToken['tokenType'];
  user_id: string;
}

export interface IUserTokenCreate {
  payload: any;
  secretKey: string;
  user_id: string;
  tokenType: IUserToken['tokenType'];
  expiresIn: string;
}

export interface IUserTokenDeleteByToken {
  token: string;
}

export interface IUserTokenDeleteByUserId {
  user_id: string;
}

export interface IUserTokenRepository {
  create(args: IUserTokenCreateRepo): Promise<UserToken>;
  getByToken(token: string): Promise<UserToken | undefined>;
  deleteByToken(args: IUserTokenDeleteByToken): Promise<UserToken | undefined>;
  deleteByUserId(args: IUserTokenDeleteByUserId): Promise<boolean>;
}

export interface IUserTokenService {
  getByToken(token: string): Promise<UserToken | undefined>;
  create(args: IUserTokenCreate): Promise<UserToken>;
  deleteByToken(args: IUserTokenDeleteByToken): Promise<UserToken | undefined>;
  deleteByUserId(args: IUserTokenDeleteByUserId): Promise<boolean>;
}

export interface ITokenArgs {
  expiresAt: string;
  secretKey: string;
  payload: any;
}

export interface ITokenVerificationInput {
  token: string;
  secretKey: string;
}

export interface ITokenService {
  generateToken(tokenData: ITokenArgs): Promise<string>;
  verifyToken(data: ITokenVerificationInput): Promise<any>;
  extractToken(args: any): string;
}
