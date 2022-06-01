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
  company_id: {
    'string.base': strings.companyIdRequired,
    'string.empty': strings.companyIdRequired,
    'any.required': strings.companyIdRequired,
  },
  task_id: {
    'string.base': strings.taskIdRequired,
    'string.empty': strings.taskIdRequired,
    'any.required': strings.taskIdRequired,
  },
  user_id: {
    'string.base': strings.EmployeeIdRequired,
    'string.empty': strings.EmployeeIdRequired,
    'any.required': strings.EmployeeIdRequired,
  },
  project_id: {
    'string.base': strings.projectIdRequired,
    'string.empty': strings.projectIdRequired,
    'any.required': strings.projectIdRequired,
  },
};

export default class TaskValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      description: Joi.string(),
      status: Joi.string().required().messages(messages.status),
      archived: Joi.boolean(),
      active: Joi.boolean(),
      manager_id: Joi.string().required().messages(messages.manager_id),
      company_id: Joi.string().required().messages(messages.company_id),
      project_id: Joi.string().required().messages(messages.project_id),
      user_ids: Joi.array(),
      attachment_ids: Joi.array(),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string(),
      description: Joi.string(),
      archived: Joi.boolean(),
      active: Joi.boolean(),
      status: Joi.string(),
      manager_id: Joi.string(),
      company_id: Joi.string(),
      project_id: Joi.string(),
      user_ids: Joi.array(),
      priority: Joi.boolean(),
      deadline: Joi.date(),
    });
  }
  static assignTask() {
    return Joi.object({
      user_id: Joi.array().required().messages(messages.user_id),
      task_id: Joi.string().required().messages(messages.task_id),
    });
  }
}
