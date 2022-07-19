import Joi from 'joi';

import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  date: {
    'string.empty': strings.dateRequired,
    'any.required': strings.dateRequired,
  },
  timeDetail: {
    'number.base': strings.timeDetailRequired,
    'string.empty': strings.timeDetailRequired,
    'any.required': strings.timeDetailRequired,
  },
  total: {
    'string.base': strings.totalHoursRequired,
    'string.empty': strings.totalHoursRequired,
    'any.required': strings.totalHoursRequired,
  },
  user_id: {
    'string.base': strings.UserIdRequired,
    'string.empty': strings.UserIdRequired,
    'any.required': strings.UserIdRequired,
  },
  workschedule_id: {
    'string.base': strings.workscheduleRequired,
    'string.empty': strings.workscheduleRequired,
    'any.required': strings.workscheduleRequired,
  },
};

export default class WorkscheduleDetailValidation {
  static create() {
    return Joi.object({
      schedule_date: Joi.date().required().messages(messages.date),
      workschedule_id: Joi.string().messages(messages.workschedule_id),
      user_id: Joi.string().required().messages(messages.user_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      schedule_date: Joi.date(),
      workschedule_id: Joi.string(),
      user_id: Joi.string(),
    });
  }
}
