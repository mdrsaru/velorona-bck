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
  client: {
    'string.base': strings.clientRequired,
    'string.empty': strings.clientRequired,
    'string.name': strings.clientRequired,
    'any.required': strings.clientRequired,
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
      client_id: Joi.string().required().messages(messages.client),
      inviter_id: Joi.string().required().messages(messages.inviter),
      role: Joi.string().required().messages(messages.role),
    });
  }
}
