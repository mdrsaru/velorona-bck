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
  symbol: {
    'string.base': strings.symbolRequired,
    'string.empty': strings.symbolRequired,
    'any.required': strings.symbolRequired,
  },
};

export default class CurrencyValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      symbol: Joi.string().messages(messages.symbol),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string().messages(messages.name),
      symbol: Joi.string().messages(messages.symbol),
    });
  }
}
