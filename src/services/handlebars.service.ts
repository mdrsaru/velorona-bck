import { injectable, inject } from 'inversify';
import Handlebars from 'handlebars';

import { TYPES } from '../types';
import * as apiError from '../utils/api-error';

import { ITemplateArgs, ITemplateService } from '../interfaces/common.interface';

@injectable()
export default class HandlebarsService implements ITemplateService {
  compile = (args: ITemplateArgs): string => {
    try {
      const template = args.template;
      const data = args.data;

      const compiled = Handlebars.compile(template);
      return compiled(data);
    } catch (err) {
      throw err;
    }
  };
}
