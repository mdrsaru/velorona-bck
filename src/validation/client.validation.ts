import { injectable } from 'inversify';
import Joi from 'joi';

import { ValidationError, NotImplementedError } from '../utils/api-error';
import { IClientCreate } from '../interfaces/client.interface';

const nameRequired = 'Name required';
const statusRequired = 'Status required';

const messages = {
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
};

export default class ClientValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().required().messages(messages.name),
      status: Joi.string().required().messages(messages.status),
    });
  }

  static update() {
    return Joi.object({
      name: Joi.string().required().required().messages(messages.name),
      status: Joi.string().required().messages(messages.status),
    });
  }
}
