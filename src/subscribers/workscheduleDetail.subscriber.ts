import fs from 'fs/promises';

import constants, { emailSetting, events, UserStatus } from '../config/constants';
import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import container from '../inversify.config';
import { TYPES } from '../types';
import { workscheduleDetailEmitter } from './emitters';
import WorkscheduleDetail from '../entities/workschedule-details.entity';
import { IWorkscheduleDetailRepository } from '../interfaces/workschedule-detail.interface';
import axios from 'axios';
import moment from 'moment';

type CreateWorkscheduleUsage = {
  workscheduleDetail: WorkscheduleDetail;
  startTime: Date;
  endTime: Date;
};

workscheduleDetailEmitter.on(events.onWorkscheduleDetailCreate, async (args: CreateWorkscheduleUsage) => {
  const operation = events.onWorkscheduleDetailCreate;
  const logger = container.get<ILogger>(TYPES.Logger);
  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const workscheduleDetailRepository: IWorkscheduleDetailRepository = container.get<IWorkscheduleDetailRepository>(
    TYPES.WorkscheduleDetailRepository
  );

  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);
  logger.init('workscheduleDetail.subscriber');

  try {
    let workscheduleDetail = await workscheduleDetailRepository.getById({
      id: args.workscheduleDetail.id,
      relations: ['user', 'workschedule', 'workschedule.company', 'workschedule.company.logo'],
    });

    const hasLogo = !!workscheduleDetail?.workschedule?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/add-workschedule-detail.template.html`, {
      encoding: 'utf-8',
    });

    let workscheduleDetails = await workscheduleDetailRepository.getAll({
      query: {
        workschedule_id: args.workscheduleDetail.workschedule_id,
        user_id: args.workscheduleDetail.user_id,
      },
      select: ['id', 'duration', 'workschedule_id'],
    });

    let totalHour: any = 0;
    workscheduleDetails?.map((workscheduleDetail) => {
      return (totalHour = (workscheduleDetail.duration as number) + totalHour);
    });

    const totalHours = (totalHour / 3600).toFixed(0);

    const workscheduleDetailHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: workscheduleDetail?.workschedule?.company?.name ?? '',
        name: workscheduleDetail?.user?.firstName,
        startTime: moment(args.startTime).format('HH:mm'),
        endTime: moment(args.endTime).format('HH:mm'),
        scheduleDate: moment(workscheduleDetail?.schedule_date).format('MM-DD-YYYY'),
        totalHours: totalHours + 'hrs',
        marketingUrl: constants.marketingEndUrl,
      },
    });

    const subject = handlebarsService.compile({
      template: emailSetting.workscheduleDetail.subject,
      data: {
        weekEndDate: moment(workscheduleDetail?.workschedule?.endDate).format('MM-DD-YYYY'),
      },
    });

    const obj: IEmailBasicArgs = {
      to: workscheduleDetail?.user.email ?? '',
      from: `${workscheduleDetail?.workschedule?.company?.name} ${emailSetting.fromEmail}`,
      subject: subject,
      html: workscheduleDetailHtml,
    };
    if (hasLogo) {
      const image = await axios.get(workscheduleDetail?.workschedule?.company?.logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: workscheduleDetail?.workschedule?.company?.logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }
    if (workscheduleDetail?.user?.status === UserStatus.Active && !workscheduleDetail?.user?.archived) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${workscheduleDetail?.user?.email}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending workschedule added email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on creating workschedule detail',
      data: {
        WorkscheduleDetail,
        err,
      },
    });
  }
});

export default workscheduleDetailEmitter;
