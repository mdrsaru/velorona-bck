import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
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
};

export default class TimesheetValidation {
  static create() {
    return Joi.object({
      total_hours: Joi.number(),
      total_expense: Joi.number(),
      client_location: Joi.string(),
      approver_id: Joi.string().required().messages(messages.approver_id),
      project_id: Joi.string().required().messages(messages.project_id),
      company_id: Joi.string().required().messages(messages.company_id),
      created_by: Joi.string().required().messages(messages.company_id),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      total_hours: Joi.number(),
      total_expense: Joi.number(),
      client_location: Joi.string(),
      approver_id: Joi.string(),
      project_id: Joi.string(),
      company_id: Joi.string(),
      created_by: Joi.string(),
    });
  }
}
