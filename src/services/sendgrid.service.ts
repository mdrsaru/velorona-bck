import isEmpty from 'lodash/isEmpty';
import { injectable, inject } from 'inversify';
import sgMail from '@sendgrid/mail';

import { TYPES } from '../types';
import { emailSetting } from '../config/constants';

import {
  IEmailService,
  EmailArgs,
  ILogger,
} from '../interfaces/common.interface';

sgMail.setApiKey(emailSetting.sendGridApi as string);

@injectable()
export default class SendGridService implements IEmailService {
  private logger: ILogger;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.logger = loggerFactory('SendGridService');
  }

  sendEmail = (args: EmailArgs): Promise<any> => {
    const operation = 'sendEmail';

    let to = args.to;
    const from = args.from;
    const subject = args.subject;
    const data = args.data;
    const cc = args.cc;
    const html = args.html;
    const text = args.text;
    const templateId = args.templateId;

    if (!isEmpty(emailSetting.testMask)) {
      to = emailSetting.testMask;
    }

    if (!emailSetting.emailEnabled) {
      this.logger.info({
        operation,
        message: 'Email is disabled',
        data: {},
      });
      return Promise.resolve();
    }

    const msg = {
      to,
      from,
      subject,
      text,
      html,
      cc,
    };

    return sgMail.send(msg);
  };
}
