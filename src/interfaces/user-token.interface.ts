import UserToken from '../entities/user-token.entity';

export interface IUserToken {
  token: string;
  expiresIn: Date;
  tokenType: string;
  user_id: string;
}

export interface IUserTokenCreate {
  payload: any;
  secretKey: string;
  user: string;
  tokenType: IUserToken['tokenType'];
  expiresIn: string;
}

export interface IUserTokenDeleteByToken {
  token: string;
}

export interface IUserTokenDeleteByUserId {
  user: string;
}

export interface IUserTokenRepository {
  create(args: IUserToken): Promise<UserToken>;
  getByToken(token: string): Promise<UserToken | null>;
  deleteByToken(args: IUserTokenDeleteByToken): Promise<UserToken | null>;
  deleteByUserId(args: IUserTokenDeleteByUserId): Promise<boolean>;
}

export interface IUserTokenService {
  getByToken(token: string): Promise<UserToken | null>;
  create(args: IUserTokenCreate): Promise<UserToken>;
  deleteByToken(args: IUserTokenDeleteByToken): Promise<UserToken | null>;
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
