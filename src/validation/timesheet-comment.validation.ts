import Joi from 'joi';
import { injectable } from 'inversify';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';

export default class TimesheetCommentValidation {
  static create() {
    return Joi.object({
      comment: Joi.string().required().error(new Error(strings.commentRequired)),
      user_id: Joi.string().required().error(new Error(strings.userIdRequired)),
      timesheet_id: Joi.string().error(new Error('Timesheet required')),
      reply_id: Joi.string().allow(null, ''),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      comment: Joi.string().required().error(new Error(strings.commentRequired)),
    });
  }
}
