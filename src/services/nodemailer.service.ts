import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import AWS from 'aws-sdk';

import { TYPES } from '../types';
import strings from '../config/strings';
import { emailSetting, aws } from '../config/constants';
import * as apiError from '../utils/api-error';

import { IEmailService, IEmailArgs, ILogger } from '../interfaces/common.interface';

AWS.config.update({
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
  region: 'us-east-1',
});

@injectable()
export default class SendGridService implements IEmailService {
  private logger: ILogger;
  private transporter: Transporter;

  constructor(@inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger) {
    this.logger = loggerFactory('SendGridService');
    this.transporter = nodemailer.createTransport({
      SES: new AWS.SES({
        apiVersion: '2010-12-01',
      }),
    });
  }

  sendEmail = (args: IEmailArgs): Promise<any> => {
    const operation = 'sendEmail';

    try {
      let to = args.to;
      const from = args.from;
      const subject = args.subject;
      const data = args.data;
      const cc = args.cc;
      const html = args.html as string;
      const text = args.text;
      const templateId = args.templateId;
      let errors: string[] = [];

      if (isNil(to) || isEmpty(to)) {
        errors.push('Argument to is required');
      }

      if (isNil(subject) || isEmpty(subject)) {
        errors.push('Argument subject is required');
      }

      if (!html && !text && !templateId) {
        throw new apiError.ValidationError({
          details: ['Either html or text or templateId is required'],
        });
      }

      if (!emailSetting.emailEnabled) {
        if (!isEmpty(emailSetting.testMask)) {
          to = emailSetting.testMask as string;
        }

        this.logger.info({
          operation,
          message: 'Email is disabled',
          data: {},
        });
        return Promise.resolve();
      }

      const msg: any = {
        to,
        from,
        subject,
        text,
        html,
        cc,
      };

      if (args?.attachments) {
        msg.attachments = args.attachments;
      }

      return this.transporter.sendMail(msg);
    } catch (err) {
      throw err;
    }
  };
}
