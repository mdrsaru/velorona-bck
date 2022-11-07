import { injectable } from 'inversify';
import AWS from 'aws-sdk';

import { aws } from '../config/constants';
import { IUploadArgs, IUploadService } from '../interfaces/common.interface';

@injectable()
export default class UploadService implements IUploadService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: aws.accessKeyId,
      secretAccessKey: aws.secretAccessKey,
      signatureVersion: 'v4',
    });
  }

  upload = async (args: IUploadArgs): Promise<string> => {
    try {
      const file = args.file;

      const result = await this.s3
        .upload({
          Bucket: aws.bucket,
          Key: `${aws.bucketKey}/${file?.originalname}`,
          Body: file?.buffer,
          ContentType: file?.mimetype,
          ACL: 'public-read',
        })
        .promise();

      return result.Location;
    } catch (err) {
      throw err;
    }
  };
}
