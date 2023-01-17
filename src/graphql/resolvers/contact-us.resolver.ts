import { inject, injectable } from 'inversify';
import fs from 'fs/promises';

import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import {
  IEmailBasicArgs,
  IEmailService,
  IErrorService,
  ILogger,
  ITemplateService,
} from '../../interfaces/common.interface';
import { TYPES } from '../../types';
import { ContactUsInput } from '../../entities/contact-us.entity';
import { emailSetting, Role } from '../../config/constants';
import { IUserRepository } from '../../interfaces/user.interface';

@injectable()
@Resolver((of) => String)
export class ContactUsResolver {
  private name = 'ContactUsResolver';
  private emailService: IEmailService;
  private handlebarsService: ITemplateService;
  private errorService: IErrorService;
  private logger: ILogger;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.emailService = _emailService;
    this.handlebarsService = _handlebarsService;
    this.errorService = _errorService;
    this.logger = loggerFactory(this.name);
    this.userRepository = _userRepository;
  }

  @Mutation((returns) => String)
  async ContactUs(@Arg('input') args: ContactUsInput, @Ctx() ctx: any): Promise<String> {
    const operation = 'ContactUs';

    try {
      const userName = args.userName;
      const email = args.email;
      const contact = args?.contact;
      const message = args.message;

      const logo = await fs.readFile(`${__dirname}/../../../public/logo.png`, { encoding: 'base64' });

      let emailTemplate = await fs.readFile(`${__dirname}/../../../templates/contact-us.template.html`, {
        encoding: 'utf-8',
      });
      const timesheetHtml = this.handlebarsService.compile({
        template: emailTemplate,
        data: {
          userName,
          email,
          contact,
          message,
        },
      });

      const { rows: users } = await this.userRepository.getAllAndCount({
        query: {
          role: Role.SuperAdmin,
        },
      });

      const mailList = users?.map((user) => {
        return user.email;
      });

      const subject = this.handlebarsService.compile({
        template: emailSetting.contactUs.subject,
        data: {
          userName: userName,
        },
      });

      const obj: IEmailBasicArgs = {
        to: mailList,
        from: `Vellorona ${emailSetting.fromEmail}`,
        subject: subject,
        html: timesheetHtml,
      };

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
      this.emailService
        .sendEmail(obj)
        .then((response) => {
          this.logger.info({
            operation,
            message: `Email response for ${emailSetting.contactUs.contactEmailAddress}`,
            data: response,
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: 'Error sending contact us email',
            data: err,
          });
        });
      let userEmailTemplate = await fs.readFile(
        `${__dirname}/../../../templates/contactUsAcknowlegement.template.html`,
        {
          encoding: 'utf-8',
        }
      );
      const userEmailHtml = this.handlebarsService.compile({
        template: userEmailTemplate,
        data: {
          user: userName,
        },
      });

      const userObj: IEmailBasicArgs = {
        to: email,
        from: `Vellorona ${emailSetting.fromEmail}`,
        subject: emailSetting.contactAcknowledgement.subject,
        html: userEmailHtml,
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
      this.emailService
        .sendEmail(userObj)
        .then((response) => {
          this.logger.info({
            operation,
            message: `Email response for ${emailSetting.contactUs.contactEmailAddress}`,
            data: response,
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: 'Error sending contact us email',
            data: err,
          });
        });

      return 'Email sent successfully';
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }
}
