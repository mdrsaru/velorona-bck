import Joi from 'joi';
import { isEmpty } from 'lodash';
import strings from '../config/strings';
import { Role as RoleEnum } from '../config/constants';

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
  entryType: {
    'string.base': strings.entryTypeRequired,
    'string.empty': strings.entryTypeRequired,
    'string.name': strings.entryTypeRequired,
    'any.required': strings.entryTypeRequired,
    'any.message': strings.entryTypeRequired,
  },
};

export default class UserValidation {
  static create() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.firstName),
      firstName: Joi.string().required().messages(messages.firstName),
      lastName: Joi.string().required().messages(messages.lastName),
      middleName: Joi.string().allow('', null),
      designation: Joi.string().allow('', null),
      phone: Joi.string().required().messages(messages.phone),
      company_id: Joi.string().required(),
      timesheet_attachment: Joi.boolean(),
      startDate: Joi.when('roles', {
        is: Joi.array().has(RoleEnum.Employee),
        then: Joi.date().required().messages(messages.startDate),
        otherwise: Joi.date(),
      }),
      endDate: Joi.date(),
      entryType: Joi.when('roles', {
        is: Joi.array().has(RoleEnum.Employee),
        then: Joi.string().required().messages(messages.entryType),
        otherwise: Joi.string(),
      }),
      address: Joi.object({
        country: Joi.string().required().allow('', null),
        streetAddress: Joi.string().required(),
        aptOrSuite: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
        zipcode: Joi.string().allow('', null),
      }).required(),
      roles: Joi.array().items(Joi.string().required()).required(),
    });
  }

  static createAdmin() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.firstName),
      firstName: Joi.string().required().messages(messages.firstName),
      lastName: Joi.string().required().messages(messages.lastName),
      middleName: Joi.string().allow('', null),
      phone: Joi.string().required().messages(messages.phone),
      address: Joi.object({
        country: Joi.string().required().allow('', null),
        streetAddress: Joi.string().required().allow('', null),
        aptOrSuite: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
        zipcode: Joi.string().allow('', null),
      }).required(),
      roles: Joi.array().items(Joi.string().required()).required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      firstName: Joi.string().messages(messages.firstName),
      lastName: Joi.string().messages(messages.lastName),
      middleName: Joi.string().allow(null, ''),
      phone: Joi.string().messages(messages.phone),
      designation: Joi.string().allow('', null),
      startDate: Joi.date(),
      endDate: Joi.date(),
      timesheet_attachment: Joi.boolean(),
      address: Joi.object({
        country: Joi.string().allow('', null),
        streetAddress: Joi.string().allow('', null),
        aptOrSuite: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        zipcode: Joi.string().allow(null, ''),
      }),
      entryType: Joi.string(),
    });
  }

  static archive() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      archived: Joi.boolean().required(),
    });
  }
}
