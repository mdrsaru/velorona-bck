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
  from: {
    'number.base': strings.fromRequired,
    'string.empty': strings.fromRequired,
    'any.required': strings.fromRequired,
  },
  to: {
    'string.base': strings.toRequired,
    'string.empty': strings.toRequired,
    'any.required': strings.toRequired,
  },
  task_id: {
    'string.base': strings.taskIdRequired,
    'string.empty': strings.taskIdRequired,
    'any.required': strings.taskIdRequired,
  },
  employee_id: {
    'string.base': strings.EmployeeIdRequired,
    'string.empty': strings.EmployeeIdRequired,
    'any.required': strings.EmployeeIdRequired,
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
      date: Joi.date().required().messages(messages.date),
      from: Joi.number().required().messages(messages.from),
      to: Joi.number().required().messages(messages.to),
      task_id: Joi.string().required().messages(messages.task_id),
      employee_id: Joi.string().required().messages(messages.employee_id),
      company_id: Joi.string().required().messages(messages.company_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      date: Joi.date().messages(messages.date),
      from: Joi.number().messages(messages.from),
      to: Joi.number().messages(messages.to),
      task_id: Joi.string().messages(messages.task_id),
      employee_id: Joi.string().messages(messages.employee_id),
      company_id: Joi.string().messages(messages.company_id),
    });
  }
}
