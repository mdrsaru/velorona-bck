import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  startTime: {
    'string.base': strings.startDateRequired,
    'string.empty': strings.startDateRequired,
    'any.required': strings.startDateRequired,
  },
  endTime: {
    'string.base': strings.endDateRequired,
    'string.empty': strings.endDateRequired,
    'any.required': strings.endDateRequired,
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

  client_id: {
    'string.base': strings.clientRequired,
    'string.empty': strings.clientRequired,
    'any.required': strings.clientRequired,
  },
};

export default class TimeEntryValidation {
  static create() {
    return Joi.object({
      startTime: Joi.date().required(),
      endTime: Joi.date(),
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
      startTime: Joi.date(),
      endTime: Joi.date(),
      clientLocation: Joi.string(),
      project_id: Joi.string(),
      company_id: Joi.string(),
      created_by: Joi.string(),
      task_id: Joi.string(),
    });
  }

  static stop() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      endTime: Joi.date().required().messages(messages.endTime),
    });
  }

  static weeklyDetails() {
    return Joi.object({
      company_id: Joi.string().required(),
      startTime: Joi.date().error(new Error(strings.startDateMustBeValidDate)),
      endTime: Joi.date().when('startTime', {
        is: Joi.exist(),
        then: Joi.date()
          .timestamp()
          .greater(Joi.ref('startTime'))
          .required()
          .error(new Error(strings.endDateMustBeValidDate)),
      }),
    });
  }

  static bulkDelete() {
    return Joi.object({
      ids: Joi.array().required(),
      company_id: Joi.string().required().messages(messages.company_id),
      created_by: Joi.string().required().messages(messages.created_by),
      client_id: Joi.string().required().messages(messages.client_id),
    });
  }
}
