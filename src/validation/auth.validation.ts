import Joi from 'joi';
import strings from '../config/strings';

const messages = {
  email: {
    'string.base': strings.emailRequired,
    'string.empty': strings.emailRequired,
    'string.name': strings.emailRequired,
    'any.required': strings.emailRequired,
    'string.email': strings.emailNotValid,
  },
  password: {
    'string.base': strings.passwordRequired,
    'string.empty': strings.passwordRequired,
    'string.name': strings.passwordRequired,
    'any.required': strings.passwordRequired,
  },
  token: {
    'string.base': strings.tokenRequired,
    'string.empty': strings.tokenRequired,
    'string.name': strings.tokenRequired,
    'any.required': strings.tokenRequired,
  },
};

export default class AuthValidation {
  static login() {
    return Joi.object({
      email: Joi.string().required().messages(messages.email),
      password: Joi.string().required().messages(messages.password),
      clientCode: Joi.string(),
    });
  }
  static forgotPassword() {
    return Joi.object({
      email: Joi.string().required().messages(messages.email),
    });
  }
  static resetPassword() {
    return Joi.object({
      token: Joi.object().required().messages(messages.token),
      password: Joi.string().required().messages(messages.password),
    });
  }
}
