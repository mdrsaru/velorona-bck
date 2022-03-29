import Joi from 'joi';
import { isEmpty } from 'lodash';
import strings from '../config/strings';

const messages = {
  email: {
    'string.base': strings.emailRequired,
    'string.empty': strings.emailRequired,
    'string.name': strings.emailRequired,
    'any.required': strings.emailRequired,
    'string.email': strings.emailNotValid,
  },
  company: {
    'string.base': strings.companyRequired,
    'string.empty': strings.companyRequired,
    'string.name': strings.companyRequired,
    'any.required': strings.companyRequired,
  },
  inviter: {
    'string.base': strings.inviterRequired,
    'string.empty': strings.inviterRequired,
    'string.name': strings.inviterRequired,
    'any.required': strings.inviterRequired,
  },
  role: {
    'string.base': strings.roleRequired,
    'string.empty': strings.roleRequired,
    'string.name': strings.roleRequired,
    'any.required': strings.roleRequired,
  },
};

export default class InvitationValidation {
  static create() {
    return Joi.object({
      email: Joi.string().email().required().messages(messages.email),
      company_id: Joi.string().required().messages(messages.company),
      inviter_id: Joi.string().required().messages(messages.inviter),
      role: Joi.string().required().messages(messages.role),
    });
  }
}
