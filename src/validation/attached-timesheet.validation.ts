import Joi from 'joi';
import { injectable } from 'inversify';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';

export default class AttachedTimesheetValidation {
  static create() {
    return Joi.object({
      description: Joi.string().required().error(new Error(strings.descriptionRequired)),
      date: Joi.date().required().error(new Error(strings.dateRequired)),
      totalCost: Joi.number().required(),
      attachment_id: Joi.string(),
      company_id: Joi.string().required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      description: Joi.string(),
      date: Joi.date(),
      totalCost: Joi.number(),
      attachment_id: Joi.string(),
    });
  }
}
