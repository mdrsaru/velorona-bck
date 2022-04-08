import sampleSize from 'lodash/sampleSize';
import { randomBytes } from 'crypto';

export interface IRandomStringGenerate {
  length: number;
}

export interface IRandomTokenGenerate {
  byteLength: number;
}

export const generateRandomStrings = (args: IRandomStringGenerate): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return sampleSize(characters, args.length).join('');
};

export const generateRandomToken = (args: IRandomTokenGenerate = { byteLength: 24 }): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(args.byteLength, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('hex'));
      }
    });
  });
};
