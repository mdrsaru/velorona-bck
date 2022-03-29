import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  id: {
    'string.base': strings.idRequired,
    'string.empty': strings.idRequired,
    'any.required': strings.idRequired,
  },
  employee_id: {
    'string.base': strings.managerIdRequired,
    'string.empty': strings.managerIdRequired,
    'any.required': strings.managerIdRequired,
  },
  task_id: {
    'string.base': strings.clientIdRequired,
    'string.empty': strings.clientIdRequired,
    'any.required': strings.clientIdRequired,
  },
};

export default class TaskAssignmentValidation {
  static assignTask() {
    return Joi.object({
      employee_id: Joi.string().required().messages(messages.employee_id),
      task_id: Joi.string().required().messages(messages.task_id),
    });
  }
}
