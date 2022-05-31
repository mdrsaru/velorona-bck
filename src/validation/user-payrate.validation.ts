import Joi from 'joi';

import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  startDate: {
    'string.empty': strings.startDateRequired,
    'any.required': strings.startDateRequired,
  },
  endDate: {
    'number.base': strings.endDateRequired,
    'string.empty': strings.endDateRequired,
    'any.required': strings.endDateRequired,
  },
  amount: {
    'string.base': strings.amountRequired,
    'string.empty': strings.amountRequired,
    'any.required': strings.amountRequired,
  },
  user_id: {
    'string.base': strings.UserIdRequired,
    'string.empty': strings.UserIdRequired,
    'any.required': strings.UserIdRequired,
  },
  project_id: {
    'string.base': strings.projectIdRequired,
    'string.empty': strings.projectIdRequired,
    'any.required': strings.projectIdRequired,
  },
};

export default class UserPayRateValidation {
  static create() {
    return Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      amount: Joi.number().required().messages(messages.amount),
      user_id: Joi.string().required().messages(messages.user_id),
      project_id: Joi.string().required().messages(messages.project_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      startDate: Joi.date().messages(messages.startDate),
      endDate: Joi.date().messages(messages.endDate),
      amount: Joi.number().messages(messages.amount),
      user_id: Joi.string().messages(messages.user_id),
      project_id: Joi.string().messages(messages.project_id),
    });
  }
}
