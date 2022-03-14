import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { IEmailService } from '../interfaces/common.interface';

@injectable()
export default class EmailService implements IEmailService {
  async sendEmail(args: any = {}): Promise<any> {
    const email = args.email;
    const token = args.token;
    const mailSubject = args.mailSubject;
    const mailBody = args.mailBody;
    const baseUrl = args.baseUrl;
    let transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'f18b9654bbac34',
        pass: '21752b24d2ed0a',
      },
    });
    let info = await transporter.sendMail({
      from: 'vellorum@vellorum.com',
      to: email,
      subject: mailSubject,
      html: `${mailBody}<b>${baseUrl}${token}</b>`,
    });
    return info;
  }
}
