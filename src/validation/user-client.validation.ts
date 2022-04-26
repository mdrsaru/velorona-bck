import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  user_id: {
    'string.base': strings.UserIdRequired,
    'string.empty': strings.UserIdRequired,
    'any.required': strings.UserIdRequired,
  },
  client_id: {
    'string.base': strings.clientRequired,
    'string.empty': strings.clientRequired,
    'any.required': strings.clientRequired,
  },
};
export default class UserClientValidation {
  static associate() {
    return Joi.object({
      user_id: Joi.string().required().messages(messages.user_id),
      client_id: Joi.string().required().messages(messages.client_id),
    });
  }

  static changeStatusToInactive() {
    return Joi.object({
      user_id: Joi.string().required().messages(messages.user_id),
    });
  }
}
