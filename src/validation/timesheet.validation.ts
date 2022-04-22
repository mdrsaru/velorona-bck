import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  start: {
    'string.base': strings.startDateRequired,
    'string.empty': strings.startDateRequired,
    'any.required': strings.startDateRequired,
  },
  end: {
    'string.base': strings.endDateRequired,
    'string.empty': strings.endDateRequired,
    'any.required': strings.endDateRequired,
  },
  approver_id: {
    'string.base': strings.approverIdRequired,
    'string.empty': strings.approverIdRequired,
    'any.required': strings.approverIdRequired,
  },
  company_id: {
    'string.base': strings.companyIdRequired,
    'string.empty': strings.companyIdRequired,
    'any.required': strings.companyIdRequired,
  },
  project_id: {
    'string.base': strings.projectIdRequired,
    'string.empty': strings.projectIdRequired,
    'any.required': strings.projectIdRequired,
  },
  created_by: {
    'string.base': strings.createdByRequired,
    'string.empty': strings.createdByRequired,
    'any.required': strings.createdByRequired,
  },
  task_id: {
    'string.base': strings.taskIdRequired,
    'string.empty': strings.taskIdRequired,
    'any.required': strings.taskIdRequired,
  },
};

export default class TimesheetValidation {
  static create() {
    return Joi.object({
      start: Joi.date().required(),
      end: Joi.date(),
      clientLocation: Joi.string(),
      project_id: Joi.string().required().messages(messages.project_id),
      company_id: Joi.string().required().messages(messages.company_id),
      created_by: Joi.string().required().messages(messages.company_id),
      task_id: Joi.string().required().messages(messages.task_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      start: Joi.date(),
      end: Joi.date(),
      clientLocation: Joi.string(),
      approver_id: Joi.string(),
      project_id: Joi.string(),
      company_id: Joi.string(),
      created_by: Joi.string(),
      task_id: Joi.string(),
    });
  }

  static stop() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      end: Joi.date().required().messages(messages.end),
    });
  }
}
