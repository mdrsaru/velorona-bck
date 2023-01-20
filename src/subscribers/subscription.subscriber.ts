import axios from 'axios';
import moment from 'moment';

import fs from 'fs/promises';

import { CompanyStatus, emailSetting, events } from '../config/constants';
import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import container from '../inversify.config';
import { TYPES } from '../types';

import { subscriptionEmitter } from './emitters';
import { IUserRepository } from '../interfaces/user.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

type CreateCompanySubscription = {
  customer_email: string;
  invoice_pdf: any;
  startDate?: Date;
  endDate?: Date;
  response?: any;
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
    relations: ['company', 'company.logo'],
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
        startDate: args?.startDate,
        endDate: args?.endDate,
        cardNumber: args.response?.payment_method_details.card.last4,
        createdAt: args.response?.created,
        amount: args.response?.amount_captured,
        paymentIntent: args.response.payment_intent,
        invoiceNumber: args.response.invoice,
      },
    });

    const obj: IEmailBasicArgs = {
      to: customer_email ?? '',
      from: `${user?.company?.name} ${emailSetting.fromEmail}`,
      subject: emailSetting.paymentSuccessful.subject,
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
            message: `Email response for ${user?.email}`,
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

type UpdateCompanySubscription = {
  company_id: string;
  status: string;
};

subscriptionEmitter.on(events.onSubscriptionUpdate, async (args: UpdateCompanySubscription) => {
  const operation = events.onSubscriptionCharged;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);

  const company_id = args.company_id;
  const status = args.status;

  const user = await userRepository.getSingleEntity({
    query: {
      company_id,
    },
    relations: ['company', 'company.logo'],
  });

  try {
    if (!user) {
      return;
    }
    const hasLogo = !!user?.company?.logo_id;

    let upgradeTemplate = await fs.readFile(`${__dirname}/../../templates/plan-upgrade.template.html`, {
      encoding: 'utf-8',
    });

    let downgradeTemplate = await fs.readFile(`${__dirname}/../../templates/plan-downgrade.template.html`, {
      encoding: 'utf-8',
    });

    const subject = handlebarsService.compile({
      template: emailSetting.updateSubscription.subject,
      data: {
        plan: user?.company?.plan,
        status: status,
      },
    });

    let template;
    if (status === 'upgrade') {
      template = upgradeTemplate;
    } else {
      template = downgradeTemplate;
    }

    // const plan = user?.company?.plan;
    const updateHtml = handlebarsService.compile({
      template: template,
      data: {
        hasLogo: hasLogo,
        companyName: user?.company?.name ?? '',
        plan: user?.company?.plan,
        companyEmail: user?.company?.adminEmail,
      },
    });

    const obj: IEmailBasicArgs = {
      to: user?.email ?? '',
      from: `${user?.company?.name} ${emailSetting.fromEmail}`,
      subject: subject,
      html: updateHtml,
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
            message: `Email response for ${user?.email}`,
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

type InvoiceFinalized = {
  invoice_pdf: any;
  periodStart: any;
  periodEnd: any;
  billingDate: any;
  invoiceNumber: any;
  customerEmail: string;
  amount: string;
};

subscriptionEmitter.on(events.onInvoiceFinalized, async (args: InvoiceFinalized) => {
  const operation = events.onSubscriptionCharged;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);

  const invoicePdf = args.invoice_pdf;
  const periodStart = args.periodStart;
  const periodEnd = args.periodEnd;
  const billingDate = args.billingDate;
  const invoiceNumber = args.invoiceNumber;
  const customerEmail = args.customerEmail;
  const amount = args.amount;

  const user = await userRepository.getSingleEntity({
    query: {
      email: customerEmail,
    },
    relations: ['company', 'company.logo'],
  });

  try {
    if (!user) {
      return;
    }
    const hasLogo = !!user?.company?.logo_id;

    let invoiceTemplate = await fs.readFile(`${__dirname}/../../templates/invoice-company.template.html`, {
      encoding: 'utf-8',
    });

    const invoiceHtml = handlebarsService.compile({
      template: invoiceTemplate,
      data: {
        invoicePdf,
        periodStart,
        periodEnd,
        billingDate,
        invoiceNumber,
        amount,
        hasLogo: hasLogo,
        companyName: user?.company?.name ?? '',
      },
    });

    const subject = handlebarsService.compile({
      template: emailSetting.invoiceCompany.subject,
      data: {
        invoiceNumber,
      },
    });

    const obj: IEmailBasicArgs = {
      to: user?.email ?? '',
      from: `${user?.company?.name} ${emailSetting.fromEmail}`,
      subject: subject,
      html: invoiceHtml,
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
            message: `Email response for ${user?.email}`,
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

type ClientInvoiceReminder = {
  subscriptionEndDate: string;
  companyName: string;
  logo?: any;
  companyAdminEmail?: string;
  status: string;
  id: string;
};

subscriptionEmitter.on(events.onClientInvoiceReminder, async (args: ClientInvoiceReminder) => {
  const operation = events.onClientInvoiceReminder;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);

  const subscriptionEndDate = args.subscriptionEndDate;
  const companyAdminEmail = args.companyAdminEmail;
  const companyName = args.companyName;
  const logo = args.logo;
  const status = args.status;

  try {
    const hasLogo = !!logo?.id;

    let subscriptionTemplate = await fs.readFile(`${__dirname}/../../templates/client-invoice-reminder.template.html`, {
      encoding: 'utf-8',
    });

    const subscriptionHtml = handlebarsService.compile({
      template: subscriptionTemplate,
      data: {
        subscriptionEndDate: moment(subscriptionEndDate).format('MM-DD-YYYY'),
        companyAdminEmail,
        hasLogo: hasLogo,
        companyName: companyName ?? '',
      },
    });

    const obj: IEmailBasicArgs = {
      to: companyAdminEmail ?? '',
      from: `${companyName} ${emailSetting.fromEmail}`,
      subject: emailSetting.subscriptionPaymentReminder.subject,
      html: subscriptionHtml,
    };

    if (hasLogo) {
      const image = await axios.get(logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }

    if (status === CompanyStatus.Active) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${companyAdminEmail}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending subscription payment reminder email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending subscription payment reminder email',
      data: {
        err,
      },
    });
  }
});

type PaymentDeclined = {
  company: any;
  response: any;
};

subscriptionEmitter.on(events.onPaymentDeclined, async (args: PaymentDeclined) => {
  const operation = events.onPaymentDeclined;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const companyName = args.company.companyName;
  const companyAdminEmail = args.company.companyAdminEmail;
  const logo = args.company?.logo;
  try {
    const hasLogo = !!logo?.id;

    let subscriptionTemplate = await fs.readFile(`${__dirname}/../../templates/payment-declined.template.html`, {
      encoding: 'utf-8',
    });

    const subscriptionHtml = handlebarsService.compile({
      template: subscriptionTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: companyName ?? '',
        cardNumber: args.response?.payment_method_details.card.last4,
        createdAt: args.response?.created,
        amount: args.response?.amount_captured,
      },
    });

    const obj: IEmailBasicArgs = {
      to: companyAdminEmail ?? '',
      from: `${companyName} ${emailSetting.fromEmail}`,
      subject: emailSetting.paymentDeclinedReminder.subject,
      html: subscriptionHtml,
    };

    if (hasLogo) {
      const image = await axios.get(logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }

    if (args.company?.status === CompanyStatus.Active) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${companyAdminEmail}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending Payment declined email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending Payment declined email',
      data: {
        err,
      },
    });
  }
});

type AutoPayEnrolled = {
  company: any;
  response: any;
};

subscriptionEmitter.on(events.onAutoPayEnrolled, async (args: AutoPayEnrolled) => {
  const operation = events.onAutoPayEnrolled;
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('subscription.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);

  const companyName = args.company.name;
  const logo = args.company?.logo;
  try {
    const hasLogo = !!logo?.id;

    let user = await userRepository.getSingleEntity({
      query: {
        company_id: args.company.id,
      },
      select: ['email'],
    });

    let subscriptionTemplate = await fs.readFile(`${__dirname}/../../templates/autopay-enrolled.template.html`, {
      encoding: 'utf-8',
    });

    const subscriptionHtml = handlebarsService.compile({
      template: subscriptionTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: companyName ?? '',
        nextScheduledDate: args.response.cancel_at && moment.unix(args.response.cancel_at).format('MM-DD-YYYY'),
      },
    });

    const obj: IEmailBasicArgs = {
      to: user?.email ?? '',
      from: `${companyName} ${emailSetting.fromEmail}`,
      subject: emailSetting.autoPayEnrolled.subject,
      html: subscriptionHtml,
    };
    if (hasLogo) {
      const image = await axios.get(logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }

    if (args.company?.status === CompanyStatus.Active) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${user?.email}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending Autopay subscription enabled email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending Autopay subscription enabled email',
      data: {
        err,
      },
    });
  }
});
