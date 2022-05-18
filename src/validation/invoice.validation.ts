import { injectable } from 'inversify';
import Joi from 'joi';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';
import { ICompanyCreate } from '../interfaces/company.interface';

export default class CompanyValidation {
  static create() {
    return Joi.object({
      status: Joi.string(),
      date: Joi.date().required().error(new Error(strings.dateRequired)),
      paymentDue: Joi.date().required().error(new Error(strings.paymentDueMustBeValid)),
      poNumber: Joi.string().required().error(new Error(strings.poNumberRequired)),
      totalAmount: Joi.number().required().error(new Error()),
      taxPercent: Joi.number(),
      notes: Joi.string().allow(null, ''),
      company_id: Joi.string().required().error(new Error(strings.companyRequired)),
      client_id: Joi.string().required().error(new Error(strings.clientRequired)),
      items: Joi.array()
        .items(
          Joi.object({
            project_id: Joi.string().required().error(new Error(strings.oneOrMoreProjectRequired)),
            hours: Joi.number().required().error(new Error(strings.hoursRequired)),
            rate: Joi.number().required().error(new Error(strings.rateRequired)),
            amount: Joi.number().required().error(new Error(strings.amountRequired)),
          })
        )
        .required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().required().error(new Error(strings.idRequired)),
      status: Joi.string(),
      date: Joi.date(),
      paymentDue: Joi.date(),
      poNumber: Joi.string(),
      totalAmount: Joi.number(),
      taxPercent: Joi.number(),
      notes: Joi.string().allow(null, ''),
      items: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          project_id: Joi.string().required().error(new Error(strings.oneOrMoreProjectRequired)),
          hours: Joi.number().required().error(new Error(strings.hoursRequired)),
          rate: Joi.number().required().error(new Error(strings.rateRequired)),
          amount: Joi.number().required().error(new Error(strings.amountRequired)),
        })
      ),
    });
  }
}
