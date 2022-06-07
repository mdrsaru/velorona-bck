import path from 'path';

import InvoiceItem from '../entities/invoice-item.entity';
import Client from '../entities/client.entity';
import { invoiceEmitter } from './emitters';
import { emailSetting, events } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';

import { IEmailService, ITemplateService, ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IInvoiceItemRepository } from '../interfaces/invoice-item.interface';
import { IClientRepository } from '../interfaces/client.interface';
import PDFService from '../services/pdf.service';

/*
 * Send invoice
 */
invoiceEmitter.on(events.sendInvoice, async (data: any) => {
  const operation = events.sendInvoice;

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('invoice.subscriber');

  const invoiceItemRepo: IInvoiceItemRepository = container.get<IInvoiceItemRepository>(TYPES.InvoiceItemRepository);
  const clientRepo: IClientRepository = container.get<IClientRepository>(TYPES.ClientRepository);

  const invoice = data.invoice;

  const client: Client = (await clientRepo.getById({
    id: invoice.client_id,
    relations: ['address'],
  })) as Client;

  const items: InvoiceItem[] = await invoiceItemRepo.getAll({
    query: {
      invoice_id: data.invoice.id,
    },
    relations: ['project'],
  });

  invoice.items = items;
  invoice.client = client;

  const pdfService = new PDFService();
  const filePath = path.join(__dirname, '../../../hello.pdf');

  // generate pdf
  const pdfBuffer = await pdfService.generateInvoicePdf(invoice);
  const pdfBase64 = pdfBuffer.toString('base64');

  const email = client?.invoicingEmail ?? client?.email;
  if (!email) {
    return logger.info({
      operation,
      message: `Client email not found for sending invoice email`,
      data: {},
    });
  }

  let emailBody: string = emailSetting.invoice.body;
  let company: Company | undefined;

  const invoiceHtml = handlebarsService.compile({
    template: emailBody,
    data: {},
  });

  const attachments = [
    {
      content: pdfBase64,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    },
  ];

  emailService
    .sendEmail({
      to: email,
      from: emailSetting.fromEmail,
      subject: emailSetting.invoice.subject,
      html: invoiceHtml,
      attachments,
    })
    .then((response) => {
      logger.info({
        operation,
        message: `Email response for ${email}`,
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
