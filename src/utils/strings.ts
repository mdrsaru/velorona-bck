import sampleSize from 'lodash/sampleSize';

export interface IRandomStringGenerate {
  length: number;
}

export const generateRandomStrings = (args: IRandomStringGenerate): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return sampleSize(characters, args.length).join('');
};
