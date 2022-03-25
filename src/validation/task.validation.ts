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
  status: {
    'string.base': strings.statusRequired,
    'string.empty': strings.statusRequired,
    'any.required': strings.statusRequired,
  },
  manager_id: {
    'string.base': strings.managerIdRequired,
    'string.empty': strings.managerIdRequired,
    'any.required': strings.managerIdRequired,
  },
  client_id: {
    'string.base': strings.clientIdRequired,
    'string.empty': strings.clientIdRequired,
    'any.required': strings.clientIdRequired,
  },
};

export default class TaskValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      status: Joi.string().required().messages(messages.status),
      is_archived: Joi.boolean().required(),
      manager_id: Joi.string().required().messages(messages.manager_id),
      client_id: Joi.string().required().messages(messages.client_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string(),
      is_archived: Joi.boolean(),
      status: Joi.string(),
      manager_id: Joi.string(),
      client_id: Joi.string(),
    });
  }
}
