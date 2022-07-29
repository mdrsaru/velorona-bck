import Joi from 'joi';
import { injectable } from 'inversify';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';

const messages = {
  description: {
    'string.base': strings.descriptionRequired,
    'string.empty': strings.descriptionRequired,
    'any.required': strings.descriptionRequired,
  },
  company: {
    'string.base': strings.companyRequired,
    'string.empty': strings.companyRequired,
    'any.required': strings.companyRequired,
  },
  timesheet: {
    'string.base': strings.timesheetIdRequired,
    'string.empty': strings.timesheetIdRequired,
    'any.required': strings.timesheetIdRequired,
  },
  attachment: {
    'string.base': strings.attachmentRequired,
    'string.empty': strings.attachmentRequired,
    'any.required': strings.attachmentRequired,
  },
};

export default class AttachedTimesheetValidation {
  static create() {
    return Joi.object({
      description: Joi.string().required().messages(messages.description),
      attachment_id: Joi.string().required().messages(messages.attachment),
      company_id: Joi.string().required().messages(messages.company),
      timesheet_id: Joi.string().messages(messages.timesheet),
      invoice_id: Joi.string(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      description: Joi.string(),
      attachment_id: Joi.string(),
    });
  }
}
