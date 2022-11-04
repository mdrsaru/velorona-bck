import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { inject, injectable } from 'inversify';

import constants from '../config/constants';
import { TYPES } from '../types';
import BlockedEmailsRepository from '../repository/blocked-emails.repository';
import { IBlockedEmailsRepository } from '../interfaces/common.interface';

@injectable()
export default class BcryptService {
  private blockedEmailsRepository: IBlockedEmailsRepository;

  constructor(@inject(TYPES.BlockedEmailsRepository) _blockedEmailsRepository: IBlockedEmailsRepository) {
    this.blockedEmailsRepository = _blockedEmailsRepository;
  }

  /**
   *
   * https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html
   * @param {Object} args - Argument object
   * @param {Object} args.messageObject - Message object from aws sns topic - https://docs.aws.amazon.com/ses/latest/dg/notification-examples.html
   */
  handleBounce = async (args: { messageObject: any }) => {
    try {
      const data = args.messageObject;
      const destination = data?.mail?.destination;
      const bounceType = data?.bounce.bounceType;

      /**
       * Add the emial to the mailing list to disable sending email.
       * https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html#bounce-object
       */
      if (bounceType === 'Permanent') {
        let emails = [];
        if (!isArray(destination)) {
          emails = [destination];
        } else {
          emails = destination;
        }

        await this.blockedEmailsRepository.create({ emails });
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html#complaint-object
   * @param {Object} args - Argument object
   * @param {Object} args.messageObject - Message object from aws sns topic - https://docs.aws.amazon.com/ses/latest/dg/notification-examples.html
   */
  handleComplaint = async (args: { messageObject: any }) => {
    try {
      const data = args.messageObject;
      const destination = data?.mail?.destination;
      const complaintFeedbackType = data?.complaint?.complaintFeedbackType;

      let emails = [];
      if (!isArray(destination)) {
        emails = [destination];
      } else {
        emails = destination;
      }

      /**
       * Since its not-spam, remove the emails from the restricted mailing list to enable sending email.
       */
      if (complaintFeedbackType === 'not-spam') {
        await this.blockedEmailsRepository.removeMany({ emails });
      } else {
        /**
         * Add the emails to the restricted mailing list to disable sending email.
         */
        await this.blockedEmailsRepository.create({ emails });
      }
    } catch (err) {
      throw err;
    }
  };
}
