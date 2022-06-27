import { injectable } from 'inversify';
import Joi from 'joi';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';
import { ICompanyCreate } from '../interfaces/company.interface';

const idRequired = 'id required';
const nameRequired = 'Name required';
const statusRequired = 'Status required';

const messages = {
  id: {
    'string.base': idRequired,
    'string.empty': idRequired,
    'string.name': idRequired,
    'any.required': idRequired,
  },
  name: {
    'string.base': nameRequired,
    'string.empty': nameRequired,
    'string.name': nameRequired,
    'any.required': nameRequired,
  },
  status: {
    'string.base': statusRequired,
    'string.empty': statusRequired,
    'any.required': statusRequired,
  },
  email: {
    'string.base': strings.emailRequired,
    'string.empty': strings.emailRequired,
    'string.name': strings.emailRequired,
    'any.required': strings.emailRequired,
    'string.email': strings.emailNotValid,
  },
};

export default class CompanyValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      status: Joi.string().required().messages(messages.status),
      archived: Joi.boolean(),
      logo_id: Joi.string(),
      user: Joi.object({
        email: Joi.string().required().messages(messages.email),
        firstName: Joi.string(),
        lastName: Joi.string(),
        middleName: Joi.string().allow('', null),
        phone: Joi.string(),
        status: Joi.string(),
        address: Joi.object({
          streetAddress: Joi.string(),
          aptOrSuite: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          zipcode: Joi.string(),
        }),
      }),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string().messages(messages.name),
      status: Joi.string().messages(messages.status),
      archived: Joi.boolean(),
      logo_id: Joi.string(),
    });
  }
}
