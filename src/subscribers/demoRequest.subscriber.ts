import fs from 'fs/promises';

import constants, { emailSetting, events, Role, UserStatus } from '../config/constants';
import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import container from '../inversify.config';
import { TYPES } from '../types';
import { demoRequestEmitter } from './emitters';
import WorkscheduleDetail from '../entities/workschedule-details.entity';
import { IWorkscheduleDetailRepository } from '../interfaces/workschedule-detail.interface';
import axios from 'axios';
import moment from 'moment';
import { IUserRepository } from '../interfaces/user.interface';

type CreateDemoRequestUsage = {
  fullName: String;
  email: String;
  phone: String;
  companyName: String;
  jobTitle: String;
};

demoRequestEmitter.on(events.onDemoRequestCreate, async (args: CreateDemoRequestUsage) => {
  const operation = events.onWorkscheduleDetailCreate;
  const logger = container.get<ILogger>(TYPES.Logger);
  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  const userRepo: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);

  logger.init('demoRequest.subscriber');

  try {
    const fullName = args.fullName;
    const email = args.email;
    const phone = args?.phone;
    const companyName = args.companyName;
    const jobTitle = args.jobTitle;

    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

    // Admin Demo Request Email

    let adminEmailTemplate = await fs.readFile(`${__dirname}/../../templates/demo-request-admin.template.html`, {
      encoding: 'utf-8',
    });

    const adminDemoRequestHtml = handlebarsService.compile({
      template: adminEmailTemplate,
      data: {
        fullName,
        email,
        phone,
        companyName,
        jobTitle,
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const { rows: users } = await userRepo.getAllAndCount({
      query: {
        role: Role.SuperAdmin,
      },
    });

    const mailList = users?.map((user) => {
      return user.email;
    });

    const adminObj: IEmailBasicArgs = {
      to: mailList,
      from: `Velorona ${emailSetting.fromEmail}`,
      subject: emailSetting.demoRequest.subject,
      html: adminDemoRequestHtml,
    };
    adminObj.attachments = [
      {
        content: logo,
        filename: 'logo.png',
        cid: 'logo',
        contentDisposition: 'inline',
        encoding: 'base64',
        // type: 'image/png',
      },
    ];
    emailService
      .sendEmail(adminObj)
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
          message: 'Error sending demo request email',
          data: err,
        });
      });

    // User Demo Request Email

    let userEmailTemplate = await fs.readFile(`${__dirname}/../../templates/demo-acknowledgement-user.template.html`, {
      encoding: 'utf-8',
    });

    const userDemoRequestHtml = handlebarsService.compile({
      template: userEmailTemplate,
      data: {
        fullName,
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const userObj: IEmailBasicArgs = {
      to: email,
      from: `Velorona ${emailSetting.fromEmail}`,
      subject: emailSetting.demoRequestAcknowledgement.subject,
      html: userDemoRequestHtml,
    };
    userObj.attachments = [
      {
        content: logo,
        filename: 'logo.png',
        cid: 'logo',
        contentDisposition: 'inline',
        encoding: 'base64',
        // type: 'image/png',
      },
    ];
    emailService
      .sendEmail(userObj)
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
          message: 'Error sending demo request email',
          data: err,
        });
      });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on send Demo request detail',
      data: {
        err,
      },
    });
  }
});

export default demoRequestEmitter;
