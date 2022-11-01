import fs from 'fs/promises';

import { companyEmitter } from './emitters';
import constants, { emailSetting, events, Role as RoleEnum } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import StripeService from '../services/stripe.service';

import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';
import axios from 'axios';
import moment from 'moment';

type UpdateCompanySubscriptionUsage = {
  company_id: string;
};

/*
 * On user create
 * Send email
 */
companyEmitter.on(events.updateCompanySubscriptionUsage, async (args: UpdateCompanySubscriptionUsage) => {
  const operation = events.updateCompanySubscriptionUsage;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const stripeService: StripeService = container.get<StripeService>(TYPES.StripeService);

  const company_id = args.company_id;

  const company = await companyRepository.getById({
    id: company_id,
    select: ['id', 'companyCode', 'subscriptionItemId', 'subscriptionId', 'plan'],
  });

  if (company && company.plan === 'Professional' && company.subscriptionId && company.subscriptionItemId) {
    const userCount = await userRepository.countEntities({
      query: {
        company_id,
        archived: false,
        role: RoleEnum.Employee,
      },
    });

    stripeService
      .createUsageRecord({
        quantity: userCount,
        action: 'set',
        subscriptionItemId: company.subscriptionItemId,
        timestamp: Math.floor(Date.now() / 1000),
      })
      .then((response) => {
        logger.info({
          operation,
          message: `Subscription usage updated for the company ${company.id} - ${company.companyCode}`,
          data: {
            id: company.id,
            companyCode: company.companyCode,
            newQuantity: response.quantity,
            subscriptionItem: response.subscription_item,
          },
        });
      })
      .catch((err) => {
        logger.error({
          operation,
          message: `Error updating subscription usage for the company ${company.id} - ${company.companyCode}`,
          data: {
            id: company.id,
            companyCode: company.companyCode,
          },
        });
      });
  }
});

type CreateCompanySubscription = {
  company_id: string;
  prices: string[];
};

companyEmitter.on(events.onSubscriptionCreate, async (args: CreateCompanySubscription) => {
  const operation = events.updateCompanySubscriptionUsage;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const subscriptionService: ISubscriptionService = container.get<ISubscriptionService>(TYPES.SubscriptionService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const stripeService: StripeService = container.get<StripeService>(TYPES.StripeService);

  const company_id = args.company_id;
  const prices = args.prices;

  await subscriptionService
    .createSubscription({
      company_id,
      prices,
      trial: true,
    })
    .then((response) => {
      logger.info({
        operation,
        message: `Subscription created for the company ${company_id}`,
        data: {
          id: company_id,
        },
      });
    })
    .catch((err) => {
      logger.error({
        operation,
        message: `Error updating subscription usage for the company ${company_id}`,
        data: {
          id: company_id,
        },
      });
    });
});

type SubscriptionEndReminderUsage = {
  company: Company;
  date: Date;
};

companyEmitter.on(events.onSubscriptionEndReminder, async (args: SubscriptionEndReminderUsage) => {
  const operation = events.sendTimesheetSubmitEmail;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const company = args.company;
  try {
    const hasLogo = !!company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/subscription-end-reminder.template.html`, {
      encoding: 'utf-8',
    });

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: company?.name ?? '',
        user: company?.name,
        date: moment(args.date).format('YYYY-MM-DD'),
      },
    });

    const obj: IEmailBasicArgs = {
      to: company?.adminEmail ?? '',
      from: emailSetting.fromEmail,
      subject: emailSetting.subscriptionEndReminder.subject,
      html: timesheetHtml,
    };

    if (hasLogo) {
      const image = await axios.get(company?.logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: company?.logo.name as string,
          content_id: 'logo',
          disposition: 'inline',
          // type: 'image/png',
        },
      ];
    }
    emailService
      .sendEmail(obj)
      .then((response) => {
        logger.info({
          operation,
          message: `Email response for ${company?.adminEmail}`,
          data: response,
        });
      })
      .catch((err) => {
        logger.error({
          operation,
          message: 'Error sending workschedule added email',
          data: err,
        });
      });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on creating workschedule detail',
      data: {
        company,
        err,
      },
    });
  }
});
export default companyEmitter;
