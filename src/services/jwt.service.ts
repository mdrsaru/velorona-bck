import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { ITokenService, ITokenVerificationInput, ITokenArgs } from '../interfaces/common.interface';

@injectable()
export default class TokenService implements ITokenService {
  generateToken = async (args: ITokenArgs): Promise<string> => {
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

  verifyToken(args: ITokenVerificationInput): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(args.token, args.secretKey, (err, decoded) => {
        if (err) {
          reject(err);
        }

        resolve(decoded);
      });
    });
  }

  extractToken(data: any) {
    try {
      let bearerToken = data['authorization'];
      if (!bearerToken) {
        return null;
      }

      const [_, token] = bearerToken.split(' ');
      return token;
    } catch (err) {
      return null;
    }
  }
}
