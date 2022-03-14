import { injectable } from 'inversify';
const jwt = require('jsonwebtoken');

import { ITokenService } from '../interfaces/common.interface';

@injectable()
export default class TokenService implements ITokenService {
  generateToken = async (args: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        args.payload,
        args.tokenSecret,
        {
          algorithm: 'HS256',
          expiresIn: args.tokenLife,
        },
        (err: any, token: any) => {
          if (err) {
            reject(err);
          }

          resolve(token);
        }
      );
    });
  };

  verifyToken = async (args: any = {}): Promise<any> => {
    const token = args.token;
    const tokenSecret = args.tokenSecret;

    return await jwt.verify(token, tokenSecret);
  };
}
