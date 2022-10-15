import path from 'path';
import fs from 'fs/promises';

import InvoiceItem from '../entities/invoice-item.entity';
import Client from '../entities/client.entity';
import { invoiceEmitter } from './emitters';
import { emailSetting, events } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import User from '../entities/user.entity';
import Address from '../entities/address.entity';

import { IEmailService, ITemplateService, ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IInvoiceItemRepository } from '../interfaces/invoice-item.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';
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
  const userRepo: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const attachedTimesheetRepository: IAttachedTimesheetRepository = container.get<IAttachedTimesheetRepository>(
    TYPES.AttachedTimesheetRepository
  );

  const invoice = data.invoice;

  try {
    const client: Client = (await clientRepo.getById({
      id: invoice.client_id,
      relations: ['address', 'company'],
    })) as Client;

    const items: InvoiceItem[] = await invoiceItemRepo.getAll({
      query: {
        invoice_id: data.invoice.id,
      },
      relations: ['project'],
    });

    let companyAddress: Address | undefined;
    if (client?.company?.adminEmail) {
      const user = await userRepo.getAll({
        query: {
          email: client?.company?.adminEmail,
          company_id: client?.company?.id,
        },
        select: ['id'],
        relations: ['address'],
      });

      if (user.length) {
        companyAddress = user?.[0]?.address;
      }
    }

    invoice.items = items;
    invoice.client = client;
    invoice.company = client.company;

    const pdfService = new PDFService();
    const filePath = path.join(__dirname, '../../../hello.pdf');

    const companyEmail = client?.company?.adminEmail;

    // generate pdf
    const pdfBuffer = await pdfService.generateInvoicePdf({
      invoice,
      companyAddress,
    });
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

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/invoice-template.html`, { encoding: 'utf-8' });

    const invoiceHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        email: email,
      },
    });

    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

    const attachments = [
      {
        content: pdfBase64,
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
      {
        content: logo,
        filename: `velorona.png`,
        content_id: 'logo',
        disposition: 'inline',
        type: 'image/png',
      },
    ];

    if (data?.timesheet_id) {
      const attached = await attachedTimesheetRepository.getBase64Attachments({
        timesheet_id: data.timesheet_id,
        invoice_id: invoice.id,
      });

      attached.forEach((att: any) => {
        attachments.push({
          content: att.base64,
          filename: att.name,
          type: att.contentType,
          disposition: 'attachment',
        });
      });
    }

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
          message: `Invoice email response for ${email}`,
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
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending invoice',
      data: {
        invoice_id: invoice?.id,
        err,
      },
    });
  }
});

function getExtension(contentType: string) {
  return contentType?.split('/')?.[1] ?? 'jpg';
}

export default invoiceEmitter;
