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
    'string.base': strings.startDateRequired,
    'string.empty': strings.startDateRequired,
    'string.name': strings.startDateRequired,
    'any.required': strings.startDateRequired,
    'any.message': strings.startDateRequired,
  },
  endDate: {
    'string.base': strings.endDateRequired,
    'string.empty': strings.endDateRequired,
    'string.name': strings.endDateRequired,
    'any.required': strings.endDateRequired,
    'any.message': strings.endDateRequired,
  },
  payRate: {
    'string.base': strings.payRateRequired,
    'string.empty': strings.payRateRequired,
    'string.name': strings.payRateRequired,
    'any.required': strings.payRateRequired,
    'any.message': strings.payRateRequired,
  },
};

export default class UserValidation {
  static create() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.firstName),
      firstName: Joi.string().required().messages(messages.firstName),
      lastName: Joi.string().required().messages(messages.lastName),
      middleName: Joi.string(),
      phone: Joi.string().required().messages(messages.phone),
      company_id: Joi.string().required(),
      address: Joi.object({
        streetAddress: Joi.string().required(),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }).required(),
      roles: Joi.array().items(Joi.string().required()).required(),
    });
  }

  static createAdmin() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.firstName),
      firstName: Joi.string().required().messages(messages.firstName),
      lastName: Joi.string().required().messages(messages.lastName),
      middleName: Joi.string(),
      phone: Joi.string().required().messages(messages.phone),
      address: Joi.object({
        streetAddress: Joi.string().required(),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }).required(),
      roles: Joi.array().items(Joi.string().required()).required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      firstName: Joi.string().messages(messages.firstName),
      lastName: Joi.string().messages(messages.lastName),
      middleName: Joi.string(),
      phone: Joi.string().messages(messages.phone),
      address: Joi.object({
        streetAddress: Joi.string(),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }),
    });
  }

  static archive() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      archived: Joi.boolean().required(),
    });
  }
}
