import axios from 'axios';

import { userEmitter } from './emitters';
import constants, { emailSetting, events, Role } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import fs from 'fs/promises';

import { IEmailService, ITemplateService, ILogger, IEmailBasicArgs } from '../interfaces/common.interface';
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
      relations: ['logo'],
    });
  }

  let superAdmin = false;
  if (data?.user.roles?.[0]?.name === Role.SuperAdmin) {
    superAdmin = true;
  }
  const hasLogo = !!company?.logo_id;

  let emailTemplate = await fs.readFile(`${__dirname}/../../templates/new-user-template.html`, { encoding: 'utf-8' });
  const userHtml = handlebarsService.compile({
    template: emailTemplate,
    data: {
      fullName: data?.user?.firstName ?? 'User!',
      companyCode: company?.companyCode ?? '',
      password: data?.password,
      link: `${constants.frontEndUrl}/login`,
      email: data?.user?.email,
      hasLogo: hasLogo,
      companyName: company?.name ?? '',
      superAdmin: superAdmin,
    },
  });

  const obj: IEmailBasicArgs = {
    to: data.user.email,
    from: emailSetting.fromEmail,
    subject: emailSetting.newUser.subject,
    html: userHtml,
  };

  if (hasLogo) {
    const image = await axios.get(company?.logo?.url as string, { responseType: 'arraybuffer' });
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
  } else if (data?.user.roles?.[0].name === Role.SuperAdmin) {
    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

    obj.attachments = [
      {
        content: logo,
        filename: 'logo.png',
        content_id: 'logo',
        disposition: 'inline',
        type: 'image/png',
      },
    ];
  }
  emailService
    .sendEmail(obj)
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
