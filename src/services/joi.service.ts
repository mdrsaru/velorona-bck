import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import { IErrorService, IValidationInput, IJoiService } from '../interfaces/common.interface';

@injectable()
export default class JoiService implements IJoiService {
  private errorService: IErrorService;

  constructor(@inject(TYPES.ErrorService) errorService: IErrorService) {
    this.errorService = errorService;
  }

  async validate(args: IValidationInput) {
    try {
      const schema = args.schema;
      const input = args.input;

      return await schema.validateAsync(input, { abortEarly: false });
    } catch (err) {
      this.errorService.throwError({
        err,
        operation: 'validate',
        name: 'JoiService',
        logError: true,
      });
    }
  }
}
