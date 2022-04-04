import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import { ClientResponse } from '@sendgrid/mail';

import { TYPES } from '../../types';
import strings from '../../config/strings';
import { emailSetting } from '../../config/constants';
import * as apiError from '../../utils/api-error';

import { IEmailService, IEmailArgs } from '../../interfaces/common.interface';

@injectable()
export default class SendGridService implements IEmailService {
  sendEmail = (args: IEmailArgs): Promise<any> => {
    const operation = 'sendEmail';

    try {
      return Promise.resolve({} as ClientResponse);
    } catch (err) {
      throw err;
    }
  };
}
