import fs from 'fs/promises';

import { companyEmitter } from './emitters';
import constants, { CompanyStatus, emailSetting, events, plans, Role, Role as RoleEnum } from '../config/constants';
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
import User from '../entities/user.entity';

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
  company: Company;
};

companyEmitter.on(events.onSubscriptionCreate, async (args: CreateCompanySubscription) => {
  const operation = events.updateCompanySubscriptionUsage;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const subscriptionService: ISubscriptionService = container.get<ISubscriptionService>(TYPES.SubscriptionService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const stripeService: StripeService = container.get<StripeService>(TYPES.StripeService);

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const company_id = args.company_id;
  const prices = args.prices;
  const company = args.company;

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

  let companyTemplate = await fs.readFile(`${__dirname}/../../templates/three-month-trial.template.html`, {
    encoding: 'utf-8',
  });

  const threeMonths = moment().add(3, 'months').format('MM-DD-YYYY');
  const user: any = await userRepository.getSingleEntity({
    query: {
      company_id: company?.id,
    },
    select: ['id', 'email'],
  });
  const companyHtml = handlebarsService.compile({
    template: companyTemplate,
    data: {
      name: company?.name,
      companyEmail: company?.adminEmail,
      endDate: company?.trialEndDate !== null ? moment(company?.trialEndDate).format('MM-DD-YYYY') : threeMonths,
      planName: company?.plan,
      marketingUrl: constants.marketingEndUrl,
    },
  });

  const companySubject = handlebarsService.compile({
    template: emailSetting.threeMonthTrial.subject,
    data: {
      companyName: company?.name,
    },
  });

  const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

  const companyObj: IEmailBasicArgs = {
    to: company?.adminEmail as string,
    from: `${company?.name} ${emailSetting.fromEmail}`,
    subject: companySubject,
    html: companyHtml,
  };

  companyObj.attachments = [
    {
      content: logo,
      filename: 'Velorona Logo',
      cid: 'logo',
      contentDisposition: 'inline',
      encoding: 'base64',
      // type: 'image/png',
    },
  ];
  if (company.status === CompanyStatus.Active && !company?.archived) {
    emailService
      .sendEmail(companyObj)
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
  }
});

type SubscriptionEndReminderUsage = {
  company: Company;
  date: Date;
  numberOfDays: number;
};

companyEmitter.on(events.onSubscriptionEndReminder, async (args: SubscriptionEndReminderUsage) => {
  const operation = events.sendTimesheetSubmitEmail;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);

  const company = args.company;

  const user: any = await userRepository.getSingleEntity({
    query: {
      company_id: company?.id,
    },
    select: ['id', 'email'],
  });

  const subscriptionEndDate = moment(company?.subscriptionPeriodEnd).format('MM-DD-YYYY');
  const number = args.numberOfDays;
  const renewLink = `${constants.frontEndUrl}/${company.companyCode}/subscriptions`;
  const autoPayLink = `${constants.frontEndUrl}/profile/${user?.id}`;

  try {
    const hasLogo = !!company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/subscription-expiry-reminder.template.html`, {
      encoding: 'utf-8',
    });

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: company?.name ?? '',
        user: company?.name,
        date: moment(args.date).format('YYYY-MM-DD'),
        subscriptionEndDate,
        number,
        renewLink,
        autoPayLink,
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const obj: IEmailBasicArgs = {
      to: company?.adminEmail ?? '',
      from: `${company?.name} ${emailSetting.fromEmail}`,
      subject: emailSetting.subscriptionEndReminder.subject,
      html: timesheetHtml,
    };

    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });
    obj.attachments = [
      {
        content: logo,
        filename: 'logo.png',
        cid: 'logo',
        contentDisposition: 'inline',
        encoding: 'base64',
        // type: 'image/png',
      },
    ];

    if (company?.status === CompanyStatus.Active && !company?.archived) {
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
    }
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

type CompanyRegisteredUsage = {
  name: string;
  email: string;
  company?: Company;
  user?: User;
};

companyEmitter.on(events.onCompanyRegistered, async (args: CompanyRegisteredUsage) => {
  const operation = events.sendTimesheetSubmitEmail;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);

  const name = args.name;
  const email = args.email;
  const company = args.company;
  const user = args.user;

  try {
    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/company-registered-template.html`, {
      encoding: 'utf-8',
    });

    let companyTemplate = await fs.readFile(`${__dirname}/../../templates/three-month-trial.template.html`, {
      encoding: 'utf-8',
    });

    const adminHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        name,
        email,
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const subject = handlebarsService.compile({
      template: emailSetting.companyRegistered.subject,
      data: {
        companyName: name,
      },
    });

    const { rows: users } = await userRepository.getAllAndCount({
      query: {
        role: Role.SuperAdmin,
      },
    });

    const mailList = users?.map((user, index) => {
      return user.email;
    });
    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

    let promises: any = [];

    const obj: any = {
      to: mailList,
      from: `Velorona ${emailSetting.fromEmail}`,
      subject: subject,
      html: adminHtml,
    };

    obj.attachments = [
      {
        content: logo,
        filename: 'Velorona Logo',
        cid: 'logo',
        contentDisposition: 'inline',
        encoding: 'base64',
        // type: 'image/png',
      },
    ];
    if (company?.status === CompanyStatus.Active && !company?.archived) {
      promises.push(emailService.sendEmail(obj));

      Promise.all(promises)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${mailList}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending company registered email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on creating company',
      data: {
        err,
      },
    });
  }
});

companyEmitter.on(events.onCompanyApproved, async (args: SubscriptionEndReminderUsage) => {
  const operation = events.onCompanyApproved;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const company = args.company;
  try {
    const hasLogo = !!company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/three.template.html`, {
      encoding: 'utf-8',
    });

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: company?.name ?? '',
        user: company?.name,
        date: moment(args.date).format('YYYY-MM-DD'),
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const obj: IEmailBasicArgs = {
      to: company?.adminEmail ?? '',
      from: `${company?.name} ${emailSetting.fromEmail}`,
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
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }
    if (company?.status === CompanyStatus.Active && !company?.archived) {
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
    }
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
