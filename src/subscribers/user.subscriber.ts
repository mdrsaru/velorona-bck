import { userEmitter } from './emitters';
import constants, { emailSetting, events } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import fs from 'fs';

import { IEmailService, ITemplateService, ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

/*
 * On user create
 * Send email
 */
userEmitter.on(events.onUserCreate, async (data: any) => {
  const operation = events.onUserCreate;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('user.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  let emailBody: string = emailSetting.newUser.adminBody;
  let company: Company | undefined;

  if (!data?.user?.email) {
    return logger.info({
      operation,
      message: `User Email not found for sending onUserCreate email`,
      data: {},
    });
  }

  if (data?.company_id) {
    emailBody = emailSetting.newUser.companyBody;
    company = await companyRepository.getById({
      id: data.company_id,
    });
  }
  let emailTemplate = fs.readFileSync(`${__dirname}/../../templates/new-user-template.html`, 'utf8').toString();

  const userHtml = handlebarsService.compile({
    template: emailTemplate,
    data: {
      fullName: data?.user?.firstName ?? 'User!',
      companyCode: company?.companyCode ?? '',
      password: data?.password,
      link: `${constants.frontEndUrl}/login`,
      email: data?.user?.email,
    },
  });

  emailService
    .sendEmail({
      to: data.user.email,
      from: emailSetting.fromEmail,
      subject: emailSetting.newUser.subject,
      html: userHtml,
    })
    .then((response) => {
      logger.info({
        operation,
        message: `Email response for ${data?.user?.email}`,
        data: response,
      });
    })
    .catch((err) => {
      logger.error({
        operation,
        message: 'Error sending user create email',
        data: err,
      });
    });
});

export default userEmitter;
