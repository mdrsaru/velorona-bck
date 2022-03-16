import Joi from 'joi';
import { isEmpty } from 'lodash';
import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'string.name': strings.idRequired,
    'any.required': strings.idRequired,
  },
  email: {
    'string.base': strings.emailRequired,
    'string.empty': strings.emailRequired,
    'string.name': strings.emailRequired,
    'any.required': strings.emailRequired,
    'string.email': strings.emailNotValid,
  },
  password: {
    'string.base': strings.passwordRequired,
    'string.empty': strings.passwordRequired,
    'string.name': strings.passwordRequired,
    'any.required': strings.passwordRequired,
  },
  firstName: {
    'string.base': strings.firstNameRequired,
    'string.empty': strings.firstNameRequired,
    'string.name': strings.firstNameRequired,
    'any.required': strings.firstNameRequired,
  },
  lastName: {
    'string.base': strings.lastNameRequired,
    'string.empty': strings.lastNameRequired,
    'string.name': strings.lastNameRequired,
    'any.required': strings.lastNameRequired,
  },
  phone: {
    'string.base': strings.phoneRequired,
    'string.empty': strings.phoneRequired,
    'string.name': strings.phoneRequired,
    'any.required': strings.phoneRequired,
  },
  roles: {
    'string.base': strings.rolesRequired,
    'string.empty': strings.rolesRequired,
    'string.name': strings.rolesRequired,
    'any.required': strings.rolesRequired,
    'any.message': strings.rolesRequired,
  },
  startDate: {
    'string.base': strings.startDate,
    'string.empty': strings.startDate,
    'string.name': strings.startDate,
    'any.required': strings.startDate,
    'any.message': strings.startDate,
  },
  endDate: {
    'string.base': strings.endDate,
    'string.empty': strings.endDate,
    'string.name': strings.endDate,
    'any.required': strings.endDate,
    'any.message': strings.endDate,
  },
  payRate: {
    'string.base': strings.payRate,
    'string.empty': strings.payRate,
    'string.name': strings.payRate,
    'any.required': strings.payRate,
    'any.message': strings.payRate,
  },
};

export default class UserValidation {
  static create() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.firstName),
      password: Joi.string().required().messages(messages.firstName),
      firstName: Joi.string().required().messages(messages.firstName),
      lastName: Joi.string().required().messages(messages.lastName),
      middleName: Joi.string(),
      phone: Joi.string().required().messages(messages.phone),
      client_id: Joi.string(),
      address: Joi.object(),
      roles: Joi.array().items(Joi.string().required()).required(),
      startDate: Joi.date().when('client_id', {
        is: undefined,
        then: Joi.date().required().messages(messages.startDate),
        otherwise: Joi.optional(),
      }),
      endDate: Joi.date().when('client_id', {
        is: undefined,
        then: Joi.date().required().messages(messages.endDate),
        otherwise: Joi.optional(),
      }),
      payRate: Joi.number().when('client_id', {
        is: undefined,
        then: Joi.number().required().messages(messages.payRate),
        otherwise: Joi.optional(),
      }),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      firstName: Joi.string().messages(messages.firstName),
      lastName: Joi.string().messages(messages.lastName),
      middleName: Joi.string(),
      phone: Joi.string().messages(messages.phone),
      address: Joi.object(),
      record: Joi.object(),
    });
  }
}
