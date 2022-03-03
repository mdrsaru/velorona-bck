import app from './app';
import constants from './config/constants';

import { TYPES } from './types';
import container from './inversify.config';
import { ILogger } from './interfaces/common.interface';

const logger = container.get<ILogger>(TYPES.Logger);
logger.init('server');

app.listen(constants.port, () => {
  logger.info({
    operation: 'serverConnection',
    message: `App is listening to port ${constants.port}`,
  });
});
