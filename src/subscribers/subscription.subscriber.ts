import axios from 'axios';
import moment from 'moment';

import fs from 'fs/promises';

import { CompanyStatus, emailSetting, events } from '../config/constants';
import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import container from '../inversify.config';
import { TYPES } from '../types';

import { subscriptionEmitter } from './emitters';
import { IUserRepository } from '../interfaces/user.interface';

type CreateCompanySubscription = {
  customer_email: string;
  invoice_pdf: any;
};

subscriptionEmitter.on(events.onSubscriptionCharged, async (args: CreateCompanySubscription) => {
  const operation = events.onSubscriptionCharged;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);

  const customer_email = args.customer_email;
  const invoice_pdf = args.invoice_pdf;

  const user = await userRepository.getSingleEntity({
    query: {
      email: customer_email,
    },
    relations: ['company'],
  });

  try {
    if (!user) {
      return;
    }
    const hasLogo = !!user?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/charge-succeed.template.html`, {
      encoding: 'utf-8',
    });

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: user?.company?.name ?? '',
        user: user?.company?.name,
        invoice_pdf,
      },
    });

    const obj: IEmailBasicArgs = {
      to: customer_email ?? '',
      from: `${user?.company?.name} ${emailSetting.fromEmail}`,
      subject: emailSetting.subscriptionEndReminder.subject,
      html: timesheetHtml,
    };

    if (hasLogo) {
      const image = await axios.get(user?.company?.logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: user?.company?.logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }

    if (user?.company?.status === CompanyStatus.Active && !user?.company?.archived) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${user?.company?.adminEmail}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending charge succeed email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending charge succeed email',
      data: {
        user,
        err,
      },
    });
  }
});
