import { invoiceEmitter } from './emitters';
import { emailSetting, events } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';

import { IEmailService, ITemplateService, ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

/*
 * Send invoice
 */
invoiceEmitter.on(events.sendInvoice, async (data: any) => {
  const operation = events.sendInvoice;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('invoice.subscriber');

  if (!data?.invoice?.invoicingEmail) {
    return logger.info({
      operation,
      message: `User Email not found for sending invoice email`,
      data: {},
    });
  }

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  let emailBody: string = emailSetting.invoice.body;
  let company: Company | undefined;

  const invoiceHtml = handlebarsService.compile({
    template: emailBody,
    data: {},
  });

  emailService
    .sendEmail({
      to: data.invoice.invoicingEmail,
      from: emailSetting.fromEmail,
      subject: emailSetting.invoice.subject,
      html: invoiceHtml,
    })
    .then((response) => {
      logger.info({
        operation,
        message: `Email response for ${data?.invoice?.invoicingEmail}`,
        data: response,
      });
    })
    .catch((err) => {
      logger.error({
        operation,
        message: 'Error sending invoice email',
        data: err,
      });
    });
});

export default invoiceEmitter;
