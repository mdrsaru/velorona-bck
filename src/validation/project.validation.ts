import Joi from 'joi';

import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  name: {
    'string.base': strings.nameRequired,
    'string.empty': strings.nameRequired,
    'any.required': strings.nameRequired,
  },
  client: {
    'string.base': strings.clientRequired,
    'string.empty': strings.clientRequired,
    'any.required': strings.clientRequired,
  },
  company: {
    'string.base': strings.companyRequired,
    'string.empty': strings.companyRequired,
    'any.required': strings.companyRequired,
  },
};

export default class ProjectValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      client_id: Joi.string().required().messages(messages.client),
      company_id: Joi.string().required().messages(messages.company),
      status: Joi.string(),
      archived: Joi.boolean(),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string().required().messages(messages.name),
      status: Joi.string(),
      archived: Joi.boolean(),
    });
  }
}
