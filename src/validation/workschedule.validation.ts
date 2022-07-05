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
  payrollAllocatedHours: {
    'string.base': strings.payrollAllocatedHoursRequired,
    'string.empty': strings.payrollAllocatedHoursRequired,
    'any.required': strings.payrollAllocatedHoursRequired,
  },
  payrollUsageHours: {
    'string.base': strings.payrollUsageHoursRequired,
    'string.empty': strings.payrollUsageHoursRequired,
    'any.required': strings.payrollUsageHoursRequired,
  },
  user_id: {
    'string.base': strings.UserIdRequired,
    'string.empty': strings.UserIdRequired,
    'any.required': strings.UserIdRequired,
  },
  company_id: {
    'string.base': strings.companyRequired,
    'string.empty': strings.companyRequired,
    'any.required': strings.companyRequired,
  },
};

export default class WorkscheduleValidation {
  static create() {
    return Joi.object({
      startDate: Joi.date().required().messages(messages.startDate),
      endDate: Joi.date().required().messages(messages.endDate),
      payrollAllocatedHours: Joi.number().required().messages(messages.payrollAllocatedHours),
      payrollUsageHours: Joi.number().messages(messages.payrollUsageHours),
      status: Joi.string(),
      company_id: Joi.string().required().messages(messages.company_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      startDate: Joi.date(),
      endDate: Joi.date(),
      payrollAllocatedHours: Joi.number(),
      payrollUsageHours: Joi.number(),
      status: Joi.string(),
      company_id: Joi.string().required().messages(messages.company_id),
    });
  }
}
