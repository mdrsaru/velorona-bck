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

const userValidation = {
  user: Joi.object({
    email: Joi.string().required().messages(messages.email),
    firstName: Joi.string().allow('', null),
    lastName: Joi.string().allow('', null),
    middleName: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    status: Joi.string().allow('', null),
    password: Joi.string(),
    address: Joi.object({
      country: Joi.string().allow('', null),
      streetAddress: Joi.string().allow('', null),
      aptOrSuite: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipcode: Joi.string().allow('', null),
    }),
  }),
};

export default class CompanyValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      status: Joi.string().required().messages(messages.status),
      archived: Joi.boolean(),
      logo_id: Joi.string(),
      plan: Joi.string(),
      ...userValidation,
    });
  }

  static signUp() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      logo_id: Joi.string(),
      ...userValidation,
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
