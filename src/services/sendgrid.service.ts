import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

import { TYPES } from '../types';
import strings from '../config/strings';
import { emailSetting } from '../config/constants';
import * as apiError from '../utils/api-error';

import { IEmailService, IEmailArgs, ILogger } from '../interfaces/common.interface';

sgMail.setApiKey(emailSetting.sendGridApi);

@injectable()
export default class SendGridService implements IEmailService {
  private logger: ILogger;

  constructor(@inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger) {
    this.logger = loggerFactory('SendGridService');
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

      const msg: MailDataRequired = {
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

      return sgMail.send(msg);
    } catch (err) {
      throw err;
    }
  };
}
