import { injectable } from 'inversify';
import Joi from 'joi';

import strings from '../config/strings';
import { ValidationError, NotImplementedError } from '../utils/api-error';
import { ICompanyCreate } from '../interfaces/company.interface';

export default class CompanyValidation {
  static create() {
    return Joi.object({
      status: Joi.string(),
      issueDate: Joi.date().required().error(new Error(strings.dateRequired)),
      dueDate: Joi.date().required().error(new Error(strings.dueDateMustBeValid)),
      poNumber: Joi.string().required().error(new Error(strings.poNumberRequired)),
      totalQuantity: Joi.number().required().error(new Error(strings.totalQuantityRequired)),
      subtotal: Joi.number().required().error(new Error(strings.subtotalRequired)),
      totalAmount: Joi.number().required().error(new Error(strings.totalAmountRequired)),
      taxPercent: Joi.number(),
      notes: Joi.string().allow(null, ''),
      company_id: Joi.string().required().error(new Error(strings.companyRequired)),
      client_id: Joi.string().required().error(new Error(strings.clientRequired)),
      items: Joi.array()
        .items(
          Joi.object({
            project_id: Joi.string().required().error(new Error(strings.oneOrMoreProjectRequired)),
            description: Joi.string().allow(null, ''),
            quantity: Joi.number().required().error(new Error(strings.quantityRequired)),
            rate: Joi.number().required().error(new Error(strings.rateRequired)),
            amount: Joi.number().required().error(new Error(strings.amountRequired)),
          })
        )
        .required(),
    });
  }

  static update() {
    return Joi.object({
      id: Joi.string().error(new Error(strings.idRequired)),
      status: Joi.string(),
      issueDate: Joi.date(),
      dueDate: Joi.date(),
      poNumber: Joi.string(),
      totalQuantity: Joi.number(),
      subtotal: Joi.number(),
      totalAmount: Joi.number(),
      taxPercent: Joi.number(),
      notes: Joi.string().allow(null, ''),
      items: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          project_id: Joi.string().required().error(new Error(strings.oneOrMoreProjectRequired)),
          description: Joi.string().allow(null, ''),
          quantity: Joi.number().required().error(new Error(strings.quantityRequired)),
          rate: Joi.number().required().error(new Error(strings.rateRequired)),
          amount: Joi.number().required().error(new Error(strings.amountRequired)),
        })
      ),
    });
  }
}
