import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { AppError } from '../utils/api-error';
import AWSService from '../services/aws.service';

import { ILogger } from '../interfaces/common.interface';

@injectable()
export default class AWSController {
  private logger: ILogger;
  private awsService: AWSService;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.AWSService) _awsService: AWSService
  ) {
    this.logger = loggerFactory('AWSController');
    this.awsService = _awsService;
  }

  handleBounceAndComplaint = async (req: Request, res: Response) => {
    const operation = 'handleBounce';

    try {
      const data: any = JSON.parse(req.body);

      if (data.Type === 'Notification') {
        const message = data.Message;
        const messageObject: any = JSON.parse(message);

        const notificationType = messageObject?.notificationType;
        if (notificationType === 'Bounce') {
          await this.awsService.handleBounce({
            messageObject,
          });
        } else if (notificationType === 'Complaint') {
          await this.awsService.handleComplaint({
            messageObject,
          });
        }
      }
    } catch (err) {
      this.logger.error({
        operation,
        message: 'Error handling bounce request',
        data: err,
      });
    }

    res.send({ message: 'Received bounce message successfully.' });
  };
}
