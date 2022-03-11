import Joi from 'joi';
const idRequired = 'ID required';
const nameRequired = 'Name required';
const descriptionRequired = 'Description required';

const messages = {
  id: {
    'string.base': idRequired,
    'string.empty': idRequired,
    'any.required': idRequired,
  },
  name: {
    'string.base': nameRequired,
    'string.empty': nameRequired,
    'any.required': nameRequired,
  },
  description: {
    'string.base': descriptionRequired,
    'string.empty': descriptionRequired,
    'any.required': descriptionRequired,
  },
};

export default class RoleValidation {
  static create() {
    return Joi.object({
      name: Joi.string().required().messages(messages.name),
      description: Joi.string().messages(messages.description),
    });
  }
  static update() {
    return Joi.object({
      id: Joi.string().required().messages(messages.id),
      name: Joi.string().required().messages(messages.name),
      description: Joi.string().messages(messages.description),
    });
  }
}
