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
import { emailSetting } from '../../config/constants';

@injectable()
@Resolver((of) => String)
export class ContactUsResolver {
  private name = 'ContactUsResolver';
  private emailService: IEmailService;
  private handlebarsService: ITemplateService;
  private errorService: IErrorService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.emailService = _emailService;
    this.handlebarsService = _handlebarsService;
    this.errorService = _errorService;
    this.logger = loggerFactory(this.name);
  }

  @Mutation((returns) => String)
  async ContactUs(@Arg('input') args: ContactUsInput, @Ctx() ctx: any): Promise<String> {
    const operation = 'ContactUs';

    try {
      const userName = args.userName;
      const email = args.email;
      const contact = args?.contact;
      const message = args.message;

      console.log(args);
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
      const obj: IEmailBasicArgs = {
        to: emailSetting.contactUs.contactEmailAddress as string,
        from: emailSetting.fromEmail,
        subject: emailSetting.contactUs.subject,
        html: timesheetHtml,
      };

      obj.attachments = [
        {
          content: logo,
          filename: 'logo.png',
          content_id: 'logo',
          disposition: 'inline',
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
