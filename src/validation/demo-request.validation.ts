import Joi from 'joi';
import { injectable } from 'inversify';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';

export default class DemoRequestValidation {
  static create() {
    return Joi.object({
      fullName: Joi.string().required().error(new Error(strings.nameRequired)),
      email: Joi.string().required().error(new Error(strings.emailRequired)),
      phone: Joi.string().allow('', null),
      jobTitle: Joi.string().allow('', null),
      companyName: Joi.string().allow('', null),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      status: Joi.string().required(),
    });
  }
}
