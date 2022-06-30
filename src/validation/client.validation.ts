import Joi from 'joi';
import { injectable } from 'inversify';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';

export default class ClientValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().error(new Error(strings.nameRequired)),
      email: Joi.string().required().error(new Error(strings.emailRequired)),
      invoicingEmail: Joi.string().required().error(new Error(strings.invoicingEmailRequired)),
      company_id: Joi.string().required().error(new Error(strings.companyRequired)),
      status: Joi.string(),
      phone: Joi.string().required().error(new Error(strings.phoneRequired)),
      archived: Joi.boolean(),
      address: Joi.object({
        country: Joi.string().required().error(new Error(strings.countryRequired)),
        streetAddress: Joi.string().required().error(new Error(strings.streetAddressRequired)),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }).required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      company_id: Joi.string().required().error(new Error(strings.companyRequired)),
      name: Joi.string(),
      status: Joi.string(),
      archived: Joi.boolean(),
      phone: Joi.string(),
      address: Joi.object({
        streetAddress: Joi.string(),
        aptOrSuite: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipcode: Joi.string(),
      }),
    });
  }
}
