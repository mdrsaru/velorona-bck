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
  oldPassword: {
    'string.base': strings.oldPasswordRequired,
    'string.empty': strings.oldPasswordRequired,
    'string.name': strings.oldPasswordRequired,
    'any.required': strings.oldPasswordRequired,
  },
  token: {
    'string.base': strings.tokenRequired,
    'string.empty': strings.tokenRequired,
    'string.name': strings.tokenRequired,
    'any.required': strings.tokenRequired,
  },
  userType: {
    'string.base': strings.userTypeRequired,
    'string.empty': strings.userTypeRequired,
    'string.name': strings.userTypeRequired,
    'any.required': strings.userTypeRequired,
  },
  company: {
    'string.base': strings.companyRequired,
    'string.empty': strings.companyRequired,
    'string.name': strings.companyRequired,
    'any.required': strings.companyRequired,
  },
  user_id: {
    'string.base': strings.userIdRequired,
    'string.empty': strings.userIdRequired,
    'string.name': strings.userIdRequired,
    'any.required': strings.userIdRequired,
  },
};

export default class AuthValidation {
  static login() {
    return Joi.object({
      email: Joi.string().required().messages(messages.email),
      password: Joi.string().required().messages(messages.password),
      companyCode: Joi.string(),
    });
  }
  static resendInvitation() {
    return Joi.object({
      user_id: Joi.string().required().messages(messages.user_id),
      company_id: Joi.string().allow('', null),
    });
  }
  static forgotPassword() {
    return Joi.object({
      email: Joi.string().required().messages(messages.email),
      userType: Joi.string().required().messages(messages.userType),
    });
  }
  static resetPassword() {
    return Joi.object({
      token: Joi.string().required().messages(messages.token),
      password: Joi.string().required().messages(messages.password),
    });
  }
  static changePassword() {
    return Joi.object({
      user_id: Joi.string().required().messages(messages.user_id),
      oldPassword: Joi.string().required().messages(messages.oldPassword),
      newPassword: Joi.string().required().messages(messages.password),
    });
  }

  static registerWithInvitation() {
    return Joi.object({
      token: Joi.string().required().messages(messages.token),
      password: Joi.string().required().messages(messages.password),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      middleName: Joi.string(),
      phone: Joi.string().required(),
      address: Joi.object({
        streetAddress: Joi.string().required(),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }).required(),
    });
  }
}
